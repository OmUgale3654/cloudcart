package com.cloudcart.order.service;

import com.cloudcart.common.dto.cart.CartDTO;
import com.cloudcart.common.dto.cart.CartItemDTO;
import com.cloudcart.common.dto.inventory.OrderItemReservation;
import com.cloudcart.common.dto.inventory.StockReservationRequest;
import com.cloudcart.common.dto.inventory.StockReservationResponse;
import com.cloudcart.common.dto.notification.NotificationRequest;
import com.cloudcart.common.dto.order.OrderCreateRequest;
import com.cloudcart.common.dto.order.OrderDTO;
import com.cloudcart.common.dto.order.OrderItemDTO;
import com.cloudcart.common.dto.payment.PaymentRequest;
import com.cloudcart.common.dto.payment.PaymentResponse;
import com.cloudcart.common.dto.payment.RefundRequest;
import com.cloudcart.common.enums.OrderStatus;
import com.cloudcart.common.enums.PaymentStatus;
import com.cloudcart.common.exception.BadRequestException;
import com.cloudcart.common.exception.PaymentFailedException;
import com.cloudcart.common.exception.ResourceNotFoundException;
import com.cloudcart.common.exception.StockUnavailableException;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.common.response.PageResponse;
import com.cloudcart.order.client.CartClient;
import com.cloudcart.order.client.InventoryClient;
import com.cloudcart.order.client.NotificationClient;
import com.cloudcart.order.client.PaymentClient;
import com.cloudcart.order.entity.Order;
import com.cloudcart.order.entity.OrderItem;
import com.cloudcart.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final NotificationClient notificationClient;

    @Transactional
    public OrderDTO checkout(Long userId, String userEmail, OrderCreateRequest request) {
        log.info("Starting checkout saga for user ID: {}", userId);

        // 1. Retrieve cart items
        ApiResponse<CartDTO> cartResponse = cartClient.getCart(userId);
        if (cartResponse == null || cartResponse.getData() == null || cartResponse.getData().getItems().isEmpty()) {
            throw new BadRequestException("Cannot proceed with checkout. Shopping cart is empty.");
        }
        CartDTO cart = cartResponse.getData();

        // 2. Compute financial breakdown
        BigDecimal subtotal = cart.getTotalAmount();
        BigDecimal taxRate = new BigDecimal("0.08"); // 8% sales tax
        BigDecimal taxAmount = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("50.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("9.99");
        BigDecimal totalAmount = subtotal.add(taxAmount).add(shippingCost);

        String orderNumber = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
                "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Build domain order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .userEmail(userEmail)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .shippingAddress(request.getShippingAddress())
                .items(new ArrayList<>())
                .build();

        for (CartItemDTO item : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(item.getProductId())
                    .sku(item.getSku())
                    .productName(item.getProductName())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .build();
            order.getItems().add(orderItem);
        }

        // 3. Saga Step 1: Stock Reservation
        List<OrderItemReservation> reservationItems = cart.getItems().stream()
                .map(i -> OrderItemReservation.builder().sku(i.getSku()).quantity(i.getQuantity()).build())
                .toList();

        StockReservationRequest stockRequest = StockReservationRequest.builder()
                .orderNumber(orderNumber)
                .items(reservationItems)
                .build();

        String reservationId = null;
        try {
            ApiResponse<StockReservationResponse> res = inventoryClient.reserveStock(stockRequest);
            if (res == null || res.getData() == null || !res.getData().isReserved()) {
                throw new StockUnavailableException("Failed to reserve inventory stock.");
            }
            reservationId = res.getData().getReservationId();
            log.info("Inventory reserved successfully. Reservation ID: {}", reservationId);
        } catch (Exception e) {
            log.error("Stock reservation failed for order {}: {}", orderNumber, e.getMessage());
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new StockUnavailableException("Stock reservation failed: " + e.getMessage());
        }

        // 4. Saga Step 2: Payment Processing
        PaymentRequest paymentRequest = PaymentRequest.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .amount(totalAmount)
                .currency("INR")
                .paymentMethod(request.getPaymentMethod())
                .paymentToken(request.getPaymentToken())
                .idempotencyKey(orderNumber)
                .build();

        PaymentResponse paymentResponse;
        try {
            ApiResponse<PaymentResponse> payRes = paymentClient.charge(paymentRequest);
            paymentResponse = (payRes != null) ? payRes.getData() : null;

            if (paymentResponse == null || paymentResponse.getStatus() != PaymentStatus.SUCCESS) {
                throw new PaymentFailedException("Payment processing returned non-success status");
            }
        } catch (Exception e) {
            log.warn("Payment failed for order {}. Triggering compensating stock release.", orderNumber);

            // COMPENSATING ACTION: Release reserved inventory
            try {
                inventoryClient.releaseReservation(reservationId);
                log.info("Compensating action complete: Stock reservation {} released.", reservationId);
            } catch (Exception rollbackEx) {
                log.error("Critical: Failed to release stock for reservation {}: {}", reservationId, rollbackEx.getMessage());
            }

            order.setStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);
            throw new PaymentFailedException("Checkout payment failed: " + e.getMessage());
        }

        // 5. Saga Completion: Payment Succeeded
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentTransactionId(paymentResponse.getTransactionId());
        Order savedOrder = orderRepository.save(order);
        log.info("Order {} confirmed successfully with payment txn {}", orderNumber, paymentResponse.getTransactionId());

        // Confirm inventory deduction permanently
        try {
            inventoryClient.confirmReservation(reservationId);
        } catch (Exception e) {
            log.warn("Non-fatal: Inventory confirmation notification error: {}", e.getMessage());
        }

        // Clear user's shopping cart
        try {
            cartClient.clearCart(userId);
        } catch (Exception e) {
            log.warn("Non-fatal: Failed to clear cart for user {}: {}", userId, e.getMessage());
        }

        // Send simulated notification
        try {
            String recipient = (userEmail != null && !userEmail.isEmpty()) ? userEmail : "customer@cloudcart.com";
            notificationClient.sendNotification(NotificationRequest.builder()
                    .recipientEmail(recipient)
                    .subject("CloudCart Order Confirmation: " + orderNumber)
                    .type("ORDER_CONFIRMATION")
                    .message(String.format("Thank you for your order! Your order %s of $%s has been placed successfully.",
                            orderNumber, totalAmount))
                    .build());
        } catch (Exception e) {
            log.warn("Non-fatal: Failed to dispatch confirmation email: {}", e.getMessage());
        }

        return mapToDTO(savedOrder);
    }

    @Transactional
    public OrderDTO cancelOrder(Long userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));

        if (!order.getUserId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this order.");
        }

        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus());
        }

        // 1. Process Refund if payment transaction exists
        if (order.getPaymentTransactionId() != null) {
            try {
                paymentClient.refund(RefundRequest.builder()
                        .transactionId(order.getPaymentTransactionId())
                        .amount(order.getTotalAmount())
                        .reason("Customer order cancellation")
                        .build());
            } catch (Exception e) {
                log.warn("Refund attempt returned: {}", e.getMessage());
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        log.info("Order {} was cancelled by user {}", orderNumber, userId);
        return mapToDTO(updated);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToDTO(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDTO> getAllOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<OrderDTO> content = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<OrderDTO>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Transactional
    public OrderDTO updateOrderStatus(String orderNumber, OrderStatus status) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));

        order.setStatus(status);
        Order updated = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderNumber, status);
        return mapToDTO(updated);
    }

    public OrderDTO mapToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(i -> OrderItemDTO.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .sku(i.getSku())
                        .productName(i.getProductName())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .subtotal(i.getSubtotal())
                        .build())
                .toList();

        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .userEmail(order.getUserEmail())
                .status(order.getStatus())
                .items(itemDTOs)
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentTransactionId(order.getPaymentTransactionId())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}

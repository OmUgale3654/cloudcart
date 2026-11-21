package com.cloudcart.order.service;

import com.cloudcart.common.dto.cart.CartDTO;
import com.cloudcart.common.dto.cart.CartItemDTO;
import com.cloudcart.common.dto.inventory.StockReservationResponse;
import com.cloudcart.common.dto.order.OrderCreateRequest;
import com.cloudcart.common.dto.order.OrderDTO;
import com.cloudcart.common.dto.payment.PaymentResponse;
import com.cloudcart.common.enums.OrderStatus;
import com.cloudcart.common.enums.PaymentMethod;
import com.cloudcart.common.enums.PaymentStatus;
import com.cloudcart.common.exception.BadRequestException;
import com.cloudcart.common.exception.PaymentFailedException;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.order.client.CartClient;
import com.cloudcart.order.client.InventoryClient;
import com.cloudcart.order.client.NotificationClient;
import com.cloudcart.order.client.PaymentClient;
import com.cloudcart.order.entity.Order;
import com.cloudcart.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartClient cartClient;

    @Mock
    private InventoryClient inventoryClient;

    @Mock
    private PaymentClient paymentClient;

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private OrderService orderService;

    private CartDTO sampleCart;
    private OrderCreateRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        CartItemDTO item = CartItemDTO.builder()
                .productId(10L)
                .sku("PROD-KEYBOARD-01")
                .productName("Mechanical Keyboard")
                .unitPrice(new BigDecimal("100.00"))
                .quantity(1)
                .subtotal(new BigDecimal("100.00"))
                .build();

        sampleCart = CartDTO.builder()
                .id(1L)
                .userId(100L)
                .items(Collections.singletonList(item))
                .totalItems(1)
                .totalAmount(new BigDecimal("100.00"))
                .build();

        checkoutRequest = OrderCreateRequest.builder()
                .shippingAddress("123 Tech Blvd, Austin, TX 78701")
                .paymentMethod(PaymentMethod.SIMULATED_GATEWAY)
                .paymentToken("CARD_SUCCESS")
                .build();
    }

    @Test
    @DisplayName("Should successfully execute checkout saga when payment succeeds")
    void shouldCompleteCheckoutSagaSuccessfully() {
        when(cartClient.getCart(100L)).thenReturn(ApiResponse.success(sampleCart));

        StockReservationResponse resResponse = StockReservationResponse.builder()
                .reservationId("RES-ABC123")
                .reserved(true)
                .build();
        when(inventoryClient.reserveStock(any())).thenReturn(ApiResponse.success(resResponse));

        PaymentResponse payResponse = PaymentResponse.builder()
                .transactionId("TXN-PAY12345")
                .status(PaymentStatus.SUCCESS)
                .build();
        when(paymentClient.charge(any())).thenReturn(ApiResponse.success(payResponse));

        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderDTO orderDTO = orderService.checkout(100L, "customer@example.com", checkoutRequest);

        assertNotNull(orderDTO);
        assertEquals(OrderStatus.CONFIRMED, orderDTO.getStatus());
        assertEquals("TXN-PAY12345", orderDTO.getPaymentTransactionId());

        // Verify saga actions
        verify(inventoryClient, times(1)).confirmReservation("RES-ABC123");
        verify(cartClient, times(1)).clearCart(100L);
        verify(notificationClient, times(1)).sendNotification(any());
        verify(inventoryClient, never()).releaseReservation(any());
    }

    @Test
    @DisplayName("Should execute compensating stock release when payment fails during checkout")
    void shouldRollbackInventoryOnPaymentFailure() {
        when(cartClient.getCart(100L)).thenReturn(ApiResponse.success(sampleCart));

        StockReservationResponse resResponse = StockReservationResponse.builder()
                .reservationId("RES-ROLLBACK")
                .reserved(true)
                .build();
        when(inventoryClient.reserveStock(any())).thenReturn(ApiResponse.success(resResponse));

        PaymentResponse payResponse = PaymentResponse.builder()
                .status(PaymentStatus.FAILED)
                .failureReason("Card declined")
                .build();
        when(paymentClient.charge(any())).thenReturn(ApiResponse.success(payResponse));

        assertThrows(PaymentFailedException.class, () ->
                orderService.checkout(100L, "customer@example.com", checkoutRequest));

        // Verify compensating action executed
        verify(inventoryClient, times(1)).releaseReservation("RES-ROLLBACK");
        verify(cartClient, never()).clearCart(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException if cart is empty")
    void shouldRejectCheckoutWhenCartEmpty() {
        CartDTO emptyCart = CartDTO.builder().userId(100L).items(new ArrayList<>()).build();
        when(cartClient.getCart(100L)).thenReturn(ApiResponse.success(emptyCart));

        assertThrows(BadRequestException.class, () ->
                orderService.checkout(100L, "customer@example.com", checkoutRequest));

        verify(inventoryClient, never()).reserveStock(any());
    }

    @Test
    @DisplayName("Should cancel confirmed order and trigger refund")
    void shouldCancelOrderAndRefund() {
        Order confirmedOrder = Order.builder()
                .id(1L)
                .orderNumber("ORD-20261121-123456")
                .userId(100L)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("108.00"))
                .paymentTransactionId("TXN-REFUND-ME")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findByOrderNumber("ORD-20261121-123456")).thenReturn(Optional.of(confirmedOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderDTO cancelled = orderService.cancelOrder(100L, "ORD-20261121-123456");

        assertEquals(OrderStatus.CANCELLED, cancelled.getStatus());
        verify(paymentClient, times(1)).refund(any());
    }
}

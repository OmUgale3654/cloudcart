package com.cloudcart.order.controller;

import com.cloudcart.common.constant.SecurityConstants;
import com.cloudcart.common.dto.order.OrderCreateRequest;
import com.cloudcart.common.dto.order.OrderDTO;
import com.cloudcart.common.dto.order.OrderStatusUpdateRequest;
import com.cloudcart.common.exception.UnauthorizedException;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.common.response.PageResponse;
import com.cloudcart.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order placement, checkout saga orchestration, tracking and status management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Execute distributed checkout saga: Cart -> Stock Reservation -> Payment Charge -> Confirmation")
    public ResponseEntity<ApiResponse<OrderDTO>> checkout(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestHeader(value = SecurityConstants.HEADER_USER_EMAIL, required = false) String userEmail,
            @RequestParam(value = "userId", required = false) Long queryUserId,
            @RequestParam(value = "email", required = false) String queryEmail,
            @Valid @RequestBody OrderCreateRequest request) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        String effectiveEmail = userEmail != null ? userEmail : queryEmail;

        OrderDTO order = orderService.checkout(effectiveUserId, effectiveEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed and confirmed successfully", order));
    }

    @PostMapping("/{orderNumber}/cancel")
    @Operation(summary = "Cancel an order and trigger refund and inventory release")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long queryUserId,
            @PathVariable String orderNumber) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        OrderDTO order = orderService.cancelOrder(effectiveUserId, orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @GetMapping
    @Operation(summary = "Get order history for current customer")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getMyOrders(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long queryUserId) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        List<OrderDTO> orders = orderService.getOrdersByUserId(effectiveUserId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Get order details and tracking status by order number")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderByOrderNumber(@PathVariable String orderNumber) {
        OrderDTO order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/admin/all")
    @Operation(summary = "Admin: Get paginated list of all customer orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderDTO>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageResponse<OrderDTO> orders = orderService.getAllOrders(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PatchMapping("/admin/{orderNumber}/status")
    @Operation(summary = "Admin: Update lifecycle status of an order")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable String orderNumber,
            @Valid @RequestBody OrderStatusUpdateRequest request) {

        OrderDTO updated = orderService.updateOrderStatus(orderNumber, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated", updated));
    }

    private Long resolveUserId(Long headerUserId, Long queryUserId) {
        if (headerUserId != null) return headerUserId;
        if (queryUserId != null) return queryUserId;
        throw new UnauthorizedException("User identification required to process orders");
    }
}

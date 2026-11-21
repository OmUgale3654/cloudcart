package com.cloudcart.payment.controller;

import com.cloudcart.common.dto.payment.PaymentRequest;
import com.cloudcart.common.dto.payment.PaymentResponse;
import com.cloudcart.common.dto.payment.RefundRequest;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Simulated payment processing, idempotency, and refunds")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/charge")
    @Operation(summary = "Process simulated payment charge with idempotency support")
    public ResponseEntity<ApiResponse<PaymentResponse>> charge(
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencyKey,
            @Valid @RequestBody PaymentRequest request) {

        if (headerIdempotencyKey != null && request.getIdempotencyKey() == null) {
            request.setIdempotencyKey(headerIdempotencyKey);
        }

        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
    }

    @PostMapping("/refund")
    @Operation(summary = "Process transaction refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refund(@Valid @RequestBody RefundRequest request) {
        PaymentResponse response = paymentService.processRefund(request);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", response));
    }

    @GetMapping("/order/{orderNumber}")
    @Operation(summary = "Get all payment transaction records for an order")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByOrderNumber(
            @PathVariable String orderNumber) {
        List<PaymentResponse> payments = paymentService.getPaymentsByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment transaction by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
}

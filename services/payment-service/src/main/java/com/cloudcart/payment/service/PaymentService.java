package com.cloudcart.payment.service;

import com.cloudcart.common.dto.payment.PaymentRequest;
import com.cloudcart.common.dto.payment.PaymentResponse;
import com.cloudcart.common.dto.payment.RefundRequest;
import com.cloudcart.common.enums.PaymentStatus;
import com.cloudcart.common.exception.BadRequestException;
import com.cloudcart.common.exception.PaymentFailedException;
import com.cloudcart.common.exception.ResourceNotFoundException;
import com.cloudcart.payment.entity.Payment;
import com.cloudcart.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for order {} with amount {} {}",
                request.getOrderNumber(), request.getAmount(), request.getCurrency());

        // 1. Idempotency Check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty()) {
            Optional<Payment> existingOpt = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
            if (existingOpt.isPresent()) {
                log.info("Idempotent payment match found for key: {}", request.getIdempotencyKey());
                Payment existing = existingOpt.get();
                if (existing.getStatus() == PaymentStatus.FAILED) {
                    throw new PaymentFailedException(existing.getFailureReason());
                }
                return mapToDTO(existing);
            }
        }

        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String token = request.getPaymentToken() != null ? request.getPaymentToken().trim() : "CARD_SUCCESS";

        PaymentStatus status;
        String failureReason = null;

        // 2. Simulated payment rules
        if ("CARD_DECLINED".equalsIgnoreCase(token)) {
            status = PaymentStatus.FAILED;
            failureReason = "Transaction declined by card issuer. Please check card details.";
        } else if ("CARD_INSUFFICIENT_FUNDS".equalsIgnoreCase(token)) {
            status = PaymentStatus.FAILED;
            failureReason = "Insufficient funds in customer account.";
        } else {
            status = PaymentStatus.SUCCESS;
        }

        Payment payment = Payment.builder()
                .transactionId(transactionId)
                .orderNumber(request.getOrderNumber())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .status(status)
                .paymentMethod(request.getPaymentMethod())
                .idempotencyKey(request.getIdempotencyKey())
                .failureReason(failureReason)
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Payment processed: Txn={}, Order={}, Status={}", transactionId, request.getOrderNumber(), status);

        if (status == PaymentStatus.FAILED) {
            throw new PaymentFailedException(failureReason);
        }

        return mapToDTO(saved);
    }

    @Transactional
    public PaymentResponse processRefund(RefundRequest request) {
        log.info("Processing refund for transaction ID: {}", request.getTransactionId());

        Payment originalPayment = paymentRepository.findByTransactionId(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "transactionId", request.getTransactionId()));

        if (originalPayment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Cannot refund a payment with status: " + originalPayment.getStatus());
        }

        originalPayment.setStatus(PaymentStatus.REFUNDED);
        originalPayment.setFailureReason("Refunded: " + (request.getReason() != null ? request.getReason() : "Customer requested"));

        Payment updated = paymentRepository.save(originalPayment);
        log.info("Transaction {} successfully refunded.", originalPayment.getTransactionId());

        return mapToDTO(updated);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByOrderNumber(String orderNumber) {
        return paymentRepository.findByOrderNumber(orderNumber).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToDTO(payment);
    }

    private PaymentResponse mapToDTO(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderNumber(payment.getOrderNumber())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}

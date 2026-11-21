package com.cloudcart.payment.service;

import com.cloudcart.common.dto.payment.PaymentRequest;
import com.cloudcart.common.dto.payment.PaymentResponse;
import com.cloudcart.common.dto.payment.RefundRequest;
import com.cloudcart.common.enums.PaymentMethod;
import com.cloudcart.common.enums.PaymentStatus;
import com.cloudcart.common.exception.PaymentFailedException;
import com.cloudcart.payment.entity.Payment;
import com.cloudcart.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment samplePayment;

    @BeforeEach
    void setUp() {
        samplePayment = Payment.builder()
                .id(1L)
                .transactionId("TXN-1234567890AB")
                .orderNumber("ORD-20261121-001")
                .userId(10L)
                .amount(new BigDecimal("149.99"))
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .paymentMethod(PaymentMethod.SIMULATED_GATEWAY)
                .idempotencyKey("KEY-12345")
                .build();
    }

    @Test
    @DisplayName("Should successfully process valid payment charge")
    void shouldProcessPaymentSuccessfully() {
        PaymentRequest request = PaymentRequest.builder()
                .orderNumber("ORD-20261121-001")
                .userId(10L)
                .amount(new BigDecimal("149.99"))
                .paymentToken("CARD_SUCCESS")
                .paymentMethod(PaymentMethod.SIMULATED_GATEWAY)
                .build();

        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertEquals("ORD-20261121-001", response.getOrderNumber());
        assertNotNull(response.getTransactionId());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should reject and record failed transaction when token is CARD_DECLINED")
    void shouldFailWhenCardDeclined() {
        PaymentRequest request = PaymentRequest.builder()
                .orderNumber("ORD-20261121-002")
                .userId(10L)
                .amount(new BigDecimal("99.99"))
                .paymentToken("CARD_DECLINED")
                .paymentMethod(PaymentMethod.SIMULATED_GATEWAY)
                .build();

        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        assertThrows(PaymentFailedException.class, () -> paymentService.processPayment(request));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should return existing payment when idempotency key is matched")
    void shouldReturnIdempotentResponse() {
        PaymentRequest request = PaymentRequest.builder()
                .orderNumber("ORD-20261121-001")
                .userId(10L)
                .amount(new BigDecimal("149.99"))
                .idempotencyKey("KEY-12345")
                .build();

        when(paymentRepository.findByIdempotencyKey("KEY-12345")).thenReturn(Optional.of(samplePayment));

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals("TXN-1234567890AB", response.getTransactionId());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should successfully refund a completed transaction")
    void shouldRefundPayment() {
        RefundRequest request = RefundRequest.builder()
                .transactionId("TXN-1234567890AB")
                .amount(new BigDecimal("149.99"))
                .reason("Defective product")
                .build();

        when(paymentRepository.findByTransactionId("TXN-1234567890AB")).thenReturn(Optional.of(samplePayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse response = paymentService.processRefund(request);

        assertNotNull(response);
        assertEquals(PaymentStatus.REFUNDED, response.getStatus());
        verify(paymentRepository, times(1)).save(samplePayment);
    }
}

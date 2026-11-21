package com.cloudcart.common.dto.payment;

import com.cloudcart.common.enums.PaymentMethod;
import com.cloudcart.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private String transactionId;
    private String orderNumber;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String failureReason;
    private Instant createdAt;
}

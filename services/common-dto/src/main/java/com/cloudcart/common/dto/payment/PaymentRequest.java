package com.cloudcart.common.dto.payment;

import com.cloudcart.common.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "Order number is required")
    private String orderNumber;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @Builder.Default
    private String currency = "INR";

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.SIMULATED_GATEWAY;

    /**
     * Simulated test card token or simulation trigger.
     * e.g., "CARD_SUCCESS", "CARD_DECLINED", "CARD_INSUFFICIENT_FUNDS"
     */
    @Builder.Default
    private String paymentToken = "CARD_SUCCESS";

    /**
     * Idempotency key to prevent double charge.
     */
    private String idempotencyKey;
}

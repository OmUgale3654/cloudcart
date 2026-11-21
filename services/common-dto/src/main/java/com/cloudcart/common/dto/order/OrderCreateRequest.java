package com.cloudcart.common.dto.order;

import com.cloudcart.common.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.SIMULATED_GATEWAY;

    @Builder.Default
    private String paymentToken = "CARD_SUCCESS";
}

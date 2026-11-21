package com.cloudcart.common.dto.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockReservationRequest {

    private String orderNumber;

    @NotEmpty(message = "Items to reserve cannot be empty")
    @Valid
    private List<OrderItemReservation> items;
}

package com.cloudcart.common.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockReservationResponse {
    private String reservationId;
    private String orderNumber;
    private boolean reserved;
    private String message;
}

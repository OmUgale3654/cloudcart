package com.cloudcart.order.client;

import com.cloudcart.common.dto.inventory.StockReservationRequest;
import com.cloudcart.common.dto.inventory.StockReservationResponse;
import com.cloudcart.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service", url = "${inventory.service.url:http://localhost:8086}")
public interface InventoryClient {

    @PostMapping("/api/v1/inventory/reserve")
    ApiResponse<StockReservationResponse> reserveStock(@RequestBody StockReservationRequest request);

    @PostMapping("/api/v1/inventory/confirm/{reservationId}")
    ApiResponse<Void> confirmReservation(@PathVariable("reservationId") String reservationId);

    @PostMapping("/api/v1/inventory/release/{reservationId}")
    ApiResponse<Void> releaseReservation(@PathVariable("reservationId") String reservationId);
}

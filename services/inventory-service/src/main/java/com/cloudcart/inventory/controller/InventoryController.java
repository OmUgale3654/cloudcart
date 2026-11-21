package com.cloudcart.inventory.controller;

import com.cloudcart.common.dto.inventory.InventoryDTO;
import com.cloudcart.common.dto.inventory.StockReservationRequest;
import com.cloudcart.common.dto.inventory.StockReservationResponse;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Stock management, concurrency reservation, and compensation APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/stock/{sku}")
    @Operation(summary = "Get available stock level for a product SKU")
    public ResponseEntity<ApiResponse<InventoryDTO>> getStockBySku(@PathVariable String sku) {
        InventoryDTO stock = inventoryService.getStockBySku(sku);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }

    @PostMapping("/reserve")
    @Operation(summary = "Reserve stock items for an order (Transactional with Pessimistic Lock)")
    public ResponseEntity<ApiResponse<StockReservationResponse>> reserveStock(
            @Valid @RequestBody StockReservationRequest request) {
        StockReservationResponse response = inventoryService.reserveStock(request);
        return ResponseEntity.ok(ApiResponse.success("Stock reserved successfully", response));
    }

    @PostMapping("/confirm/{reservationId}")
    @Operation(summary = "Permanently deduct reserved stock upon successful payment")
    public ResponseEntity<ApiResponse<Void>> confirmReservation(@PathVariable String reservationId) {
        inventoryService.confirmReservation(reservationId);
        return ResponseEntity.ok(ApiResponse.success("Stock reservation confirmed successfully"));
    }

    @PostMapping("/release/{reservationId}")
    @Operation(summary = "Compensating action: Release reserved stock back to available inventory")
    public ResponseEntity<ApiResponse<Void>> releaseReservation(@PathVariable String reservationId) {
        inventoryService.releaseReservation(reservationId);
        return ResponseEntity.ok(ApiResponse.success("Stock reservation released successfully"));
    }

    @PutMapping("/stock/{sku}")
    @Operation(summary = "Admin: Update or replenish stock level for a SKU")
    public ResponseEntity<ApiResponse<InventoryDTO>> updateStock(
            @PathVariable String sku,
            @RequestParam int quantity) {
        InventoryDTO updated = inventoryService.updateStock(sku, quantity);
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", updated));
    }
}

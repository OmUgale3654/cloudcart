package com.cloudcart.product.client;

import com.cloudcart.common.dto.inventory.InventoryDTO;
import com.cloudcart.common.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class InventoryClientFallback implements InventoryClient {

    private static final Logger log = LoggerFactory.getLogger(InventoryClientFallback.class);

    @Override
    public ApiResponse<InventoryDTO> getStockBySku(String sku) {
        log.warn("Inventory Service is unavailable. Returning fallback stock info for SKU: {}", sku);
        return ApiResponse.success(InventoryDTO.builder()
                .sku(sku)
                .availableQuantity(0)
                .reservedQuantity(0)
                .build());
    }
}

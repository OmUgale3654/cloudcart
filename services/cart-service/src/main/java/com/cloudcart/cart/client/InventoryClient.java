package com.cloudcart.cart.client;

import com.cloudcart.common.dto.inventory.InventoryDTO;
import com.cloudcart.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service", contextId = "cartInventoryClient", url = "${inventory.service.url:http://localhost:8086}")
public interface InventoryClient {

    @GetMapping("/api/v1/inventory/stock/{sku}")
    ApiResponse<InventoryDTO> getStockBySku(@PathVariable("sku") String sku);
}

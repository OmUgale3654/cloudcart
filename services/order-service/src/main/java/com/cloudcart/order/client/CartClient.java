package com.cloudcart.order.client;

import com.cloudcart.common.dto.cart.CartDTO;
import com.cloudcart.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "cart-service", contextId = "orderCartClient", url = "${cart.service.url:http://localhost:8083}")
public interface CartClient {

    @GetMapping("/api/v1/cart")
    ApiResponse<CartDTO> getCart(@RequestParam("userId") Long userId);

    @DeleteMapping("/api/v1/cart/clear")
    ApiResponse<Void> clearCart(@RequestParam("userId") Long userId);
}

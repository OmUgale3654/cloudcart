package com.cloudcart.cart.client;

import com.cloudcart.common.dto.product.ProductDTO;
import com.cloudcart.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", contextId = "cartProductClient", url = "${product.service.url:http://localhost:8082}")
public interface ProductClient {

    @GetMapping("/api/v1/products/{id}")
    ApiResponse<ProductDTO> getProductById(@PathVariable("id") Long id);
}

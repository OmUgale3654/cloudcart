package com.cloudcart.gateway.controller;

import com.cloudcart.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/users")
    public Mono<ResponseEntity<ApiResponse<Void>>> userFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("User Service is temporarily unavailable. Please try again shortly.")));
    }

    @GetMapping("/products")
    public Mono<ResponseEntity<ApiResponse<Void>>> productFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Product Service is temporarily unavailable. Please try again shortly.")));
    }

    @GetMapping("/orders")
    public Mono<ResponseEntity<ApiResponse<Void>>> orderFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Order Service is temporarily unavailable. Please try again shortly.")));
    }
}

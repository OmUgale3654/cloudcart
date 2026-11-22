package com.cloudcart.unified.controller;

import com.cloudcart.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Application health check APIs")
public class HealthController {

    @GetMapping
    @Operation(summary = "Health check endpoint", description = "Returns HTTP 200 and confirms CloudCart backend is running")
    public ResponseEntity<ApiResponse<Void>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.success("CloudCart backend is running"));
    }
}

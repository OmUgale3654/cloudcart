package com.cloudcart.notification.controller;

import com.cloudcart.common.dto.notification.NotificationRequest;
import com.cloudcart.common.dto.notification.NotificationResponse;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Simulated notification dispatcher and delivery audit log APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @Operation(summary = "Dispatch a simulated notification (Email / SMS)")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendNotification(
            @Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Notification dispatched successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get recent notification audit log")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getRecentNotifications() {
        List<NotificationResponse> list = notificationService.getRecentNotifications();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/recipient/{email}")
    @Operation(summary = "Get notifications sent to a specific email address")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotificationsByRecipient(
            @PathVariable String email) {
        List<NotificationResponse> list = notificationService.getNotificationsByRecipient(email);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}

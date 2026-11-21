package com.cloudcart.order.client;

import com.cloudcart.common.dto.notification.NotificationRequest;
import com.cloudcart.common.dto.notification.NotificationResponse;
import com.cloudcart.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", contextId = "orderNotificationClient", url = "${notification.service.url:http://localhost:8087}", fallback = NotificationClientFallback.class)
public interface NotificationClient {

    @PostMapping("/api/v1/notifications/send")
    ApiResponse<NotificationResponse> sendNotification(@RequestBody NotificationRequest request);
}

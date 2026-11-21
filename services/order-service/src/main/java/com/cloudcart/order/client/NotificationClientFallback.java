package com.cloudcart.order.client;

import com.cloudcart.common.dto.notification.NotificationRequest;
import com.cloudcart.common.dto.notification.NotificationResponse;
import com.cloudcart.common.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class NotificationClientFallback implements NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClientFallback.class);

    @Override
    public ApiResponse<NotificationResponse> sendNotification(NotificationRequest request) {
        log.warn("Notification Service is unavailable. Notification skipped for: {}", request.getRecipientEmail());
        return ApiResponse.success(NotificationResponse.builder()
                .recipientEmail(request.getRecipientEmail())
                .status("QUEUED_FALLBACK")
                .build());
    }
}

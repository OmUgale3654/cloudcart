package com.cloudcart.common.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String recipientEmail;
    private String subject;
    private String status; // SENT, FAILED
    private String type;
    private Instant sentAt;
}

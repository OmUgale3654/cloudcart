package com.cloudcart.common.dto.notification;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Recipient email must be valid")
    private String recipientEmail;

    private String recipientPhone;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message content is required")
    private String message;

    @NotBlank(message = "Notification type is required")
    private String type; // e.g. ORDER_CONFIRMATION, PAYMENT_SUCCESS, PAYMENT_FAILED
}

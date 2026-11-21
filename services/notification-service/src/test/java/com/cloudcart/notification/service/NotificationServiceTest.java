package com.cloudcart.notification.service;

import com.cloudcart.common.dto.notification.NotificationRequest;
import com.cloudcart.common.dto.notification.NotificationResponse;
import com.cloudcart.notification.entity.Notification;
import com.cloudcart.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = Notification.builder()
                .id(1L)
                .recipientEmail("user@example.com")
                .subject("Order Confirmed")
                .message("Your order ORD-12345 has been confirmed.")
                .type("ORDER_CONFIRMATION")
                .status("SENT")
                .sentAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Should successfully send notification and record dispatch status")
    void shouldSendNotification() {
        NotificationRequest request = NotificationRequest.builder()
                .recipientEmail("user@example.com")
                .subject("Order Confirmed")
                .message("Your order ORD-12345 has been confirmed.")
                .type("ORDER_CONFIRMATION")
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

        NotificationResponse response = notificationService.sendNotification(request);

        assertNotNull(response);
        assertEquals("user@example.com", response.getRecipientEmail());
        assertEquals("SENT", response.getStatus());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should retrieve notification history by recipient email")
    void shouldGetNotificationsByRecipient() {
        when(notificationRepository.findByRecipientEmailOrderBySentAtDesc("user@example.com"))
                .thenReturn(Collections.singletonList(sampleNotification));

        List<NotificationResponse> result = notificationService.getNotificationsByRecipient("user@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Order Confirmed", result.get(0).getSubject());
    }
}

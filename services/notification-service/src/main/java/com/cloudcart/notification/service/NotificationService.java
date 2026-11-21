package com.cloudcart.notification.service;

import com.cloudcart.common.dto.notification.NotificationRequest;
import com.cloudcart.common.dto.notification.NotificationResponse;
import com.cloudcart.notification.entity.Notification;
import com.cloudcart.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationResponse sendNotification(NotificationRequest request) {
        log.info("--------------------------------------------------------------------------------");
        log.info("[SIMULATED EMAIL/SMS NOTIFICATION DISPATCHED]");
        log.info("To: {}", request.getRecipientEmail());
        log.info("Type: {}", request.getType());
        log.info("Subject: {}", request.getSubject());
        log.info("Message:\n{}", request.getMessage());
        log.info("--------------------------------------------------------------------------------");

        Notification notification = Notification.builder()
                .recipientEmail(request.getRecipientEmail().trim())
                .recipientPhone(request.getRecipientPhone())
                .subject(request.getSubject().trim())
                .message(request.getMessage())
                .type(request.getType().trim().toUpperCase())
                .status("SENT")
                .build();

        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentNotifications() {
        return notificationRepository.findAll(Sort.by(Sort.Direction.DESC, "sentAt")).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByRecipient(String email) {
        return notificationRepository.findByRecipientEmailOrderBySentAtDesc(email.trim()).stream()
                .map(this::mapToDTO)
                .toList();
    }

    private NotificationResponse mapToDTO(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientEmail(notification.getRecipientEmail())
                .subject(notification.getSubject())
                .status(notification.getStatus())
                .type(notification.getType())
                .sentAt(notification.getSentAt())
                .build();
    }
}

package com.sems.controller;

import com.sems.entity.Notification;
import com.sems.security.UserPrincipal;
import com.sems.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getId();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.markAsRead(id);
        if (notification != null) return ResponseEntity.ok(notification);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead() {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.badRequest().build();
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}

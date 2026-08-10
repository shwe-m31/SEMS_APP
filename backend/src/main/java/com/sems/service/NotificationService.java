package com.sems.service;

import com.sems.entity.Branch;
import com.sems.entity.Notification;
import com.sems.entity.User;
import com.sems.repository.BranchRepository;
import com.sems.repository.NotificationRepository;
import com.sems.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               BranchRepository branchRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional
    public Notification createNotification(Long userId, Long branchId,
                                           Notification.NotificationType type,
                                           String title, String message) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;

        Notification notification = new Notification();
        notification.setUser(user);
        if (branchId != null) {
            branchRepository.findById(branchId).ifPresent(notification::setBranch);
        }
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId).size();
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null) return null;
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}

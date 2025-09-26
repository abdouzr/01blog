// backend/src/main/java/com/zerooneblog/service/NotificationService.java
package com.zerooneblog.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zerooneblog.model.Notification;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.NotificationRepository;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getNotificationsByUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotificationsByUser(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public Long getUnreadNotificationCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markNotificationAsRead(Long notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent()) {
            notification.get().setRead(true);
            notificationRepository.save(notification.get());
        }
    }

    public void markAllNotificationsAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotificationsByUser(user);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    // Create notification for likes
    public void createLikeNotification(User liker, Post post) {
        if (!liker.getId().equals(post.getAuthor().getId())) { // Don't notify if user likes own post
            String message = "liked your post";
            Notification notification = new Notification(message, post.getAuthor(), post);
            notification.setFromUser(liker);
            notification.setType(Notification.NotificationType.LIKE);
            notificationRepository.save(notification);
        }
    }

    // Create notification for comments
    public void createCommentNotification(User commenter, Post post, String commentContent) {
        if (!commenter.getId().equals(post.getAuthor().getId())) { // Don't notify if user comments on own post
            String message = "commented on your post";
            if (commentContent.length() > 50) {
                message += ": \"" + commentContent.substring(0, 50) + "...\"";
            } else {
                message += ": \"" + commentContent + "\"";
            }
            Notification notification = new Notification(message, post.getAuthor(), post);
            notification.setFromUser(commenter);
            notification.setType(Notification.NotificationType.COMMENT);
            notificationRepository.save(notification);
        }
    }

    // Create notification for follows
    public void createFollowNotification(User follower, User followedUser) {
        String message = "started following you";
        Notification notification = new Notification(message, followedUser, null);
        notification.setFromUser(follower);
        notification.setType(Notification.NotificationType.FOLLOW);
        notificationRepository.save(notification);
    }
}


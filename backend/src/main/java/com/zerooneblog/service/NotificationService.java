package com.zerooneblog.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Notification;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.NotificationRepository;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired 
    private UserService userService; 

    public List<Notification> getNotificationsByUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotificationsByUser(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public Long getUnreadNotificationCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent()) {
            notification.get().setRead(true);
            notificationRepository.save(notification.get());
        }
    }

    @Transactional
    public void markAllNotificationsAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotificationsByUser(user);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    // Create notification for likes
    public void createLikeNotification(User liker, Post post) {
        if (!liker.getId().equals(post.getAuthor().getId())) { 
            String message = liker.getUsername() + " liked your post";
            Notification notification = new Notification(message, post.getAuthor(), post);
            notification.setFromUser(liker);
            notification.setType(Notification.NotificationType.LIKE);
            notificationRepository.save(notification);
        }
    }

    // Create notification for comments
    public void createCommentNotification(User commenter, Post post, String commentContent) {
        if (!commenter.getId().equals(post.getAuthor().getId())) { 
            String message = commenter.getUsername() + " commented on your post";
            // ... truncated content logic ...
            Notification notification = new Notification(message, post.getAuthor(), post);
            notification.setFromUser(commenter);
            notification.setType(Notification.NotificationType.COMMENT);
            notificationRepository.save(notification);
        }
    }

    // Create notification for follows
    public void createFollowNotification(User follower, User followedUser) {
        String message = follower.getUsername() + " started following you";
        Notification notification = new Notification(message, followedUser, null);
        notification.setFromUser(follower);
        notification.setType(Notification.NotificationType.FOLLOW);
        notificationRepository.save(notification);
    }
    
    /**
     * Creates notifications for all followers when a user publishes a new post.
     */
    @Transactional
    public void createNewPostNotification(Post post) {
        User author = post.getAuthor();
        // Assuming User model has 'subscribers' set for followers (users who follow this author)
        Set<User> followers = author.getSubscribers(); 
        
        List<Notification> notifications = followers.stream()
            .filter(follower -> !follower.getId().equals(author.getId())) // Filter out the author
            .map(follower -> {
                String message = author.getUsername() + " published a new post";
                Notification notification = new Notification(message, follower, post);
                notification.setFromUser(author);
                notification.setType(Notification.NotificationType.POST); // Assuming POST type exists
                return notification;
            })
            .collect(Collectors.toList());
            
        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }
}
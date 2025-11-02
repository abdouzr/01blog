// backend/src/main/java/com/zerooneblog/service/NotificationService.java
package com.zerooneblog.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Notification;
import com.zerooneblog.model.Notification.NotificationType;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.NotificationRepository;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    /**
     * Creates notifications for all followers when a user creates a new post
     */
    @Transactional
    public void createNewPostNotification(Post post) {
        try {
            User author = post.getAuthor();
            
            logger.info("🚀 ========== STARTING NOTIFICATION CREATION ==========");
            logger.info("📝 Post ID: {}", post.getId());
            logger.info("👤 Author: {} (ID: {})", author.getUsername(), author.getId());
            logger.info("📊 Author has {} subscribers", author.getSubscribers().size());
            
            // Get all users who are subscribed to the post author (followers)
            List<User> followers = author.getSubscribers().stream()
                .map(subscription -> {
                    User follower = subscription.getSubscriber();
                    logger.info("   👥 Follower found: {} (ID: {})", follower.getUsername(), follower.getId());
                    return follower;
                })
                .toList();
            
            logger.info("📢 Creating POST notifications for {} followers of user {}", 
                        followers.size(), author.getUsername());
            
            if (followers.isEmpty()) {
                logger.warn("⚠️ No followers found! User {} has no subscribers.", author.getUsername());
                logger.info("🔍 Checking subscribers directly:");
                author.getSubscribers().forEach(sub -> {
                    logger.info("   - Subscription: {} follows {}", 
                        sub.getSubscriber().getUsername(), 
                        sub.getSubscribedTo().getUsername());
                });
                return;
            }
            
            // Create a notification for each follower
            int successCount = 0;
            for (User follower : followers) {
                try {
                    logger.info("   📤 Creating notification for: {}", follower.getUsername());
                    
                    Notification notification = new Notification();
                    notification.setMessage("posted a new update");
                    notification.setType(NotificationType.POST);
                    notification.setUser(follower); // The user who will receive the notification
                    notification.setFromUser(author); // The user who created the post
                    notification.setRelatedPost(post);
                    notification.setRead(false);
                    
                    Notification savedNotification = notificationRepository.save(notification);
                    successCount++;
                    
                    logger.info("   ✅ Notification saved with ID: {} for user: {}", 
                        savedNotification.getId(), follower.getUsername());
                } catch (Exception e) {
                    logger.error("   ❌ Failed to create notification for follower {}: {}", 
                                follower.getUsername(), e.getMessage());
                    e.printStackTrace();
                }
            }
            
            logger.info("✅ Successfully created {}/{} notifications", successCount, followers.size());
            logger.info("🏁 ========== NOTIFICATION CREATION COMPLETE ==========");
            
        } catch (Exception e) {
            logger.error("❌ CRITICAL ERROR in createNewPostNotification: {}", e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Get all notifications for a user, ordered by most recent first
     */
    public List<Notification> getNotificationsByUser(User user) {
        logger.info("📥 Fetching all notifications for user: {} (ID: {})", user.getUsername(), user.getId());
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        logger.info("✅ Found {} notifications for user: {}", notifications.size(), user.getUsername());
        return notifications;
    }
    
    /**
     * Get only unread notifications for a user
     */
    public List<Notification> getUnreadNotificationsByUser(User user) {
        logger.info("📥 Fetching unread notifications for user: {} (ID: {})", user.getUsername(), user.getId());
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        logger.info("✅ Found {} unread notifications for user: {}", notifications.size(), user.getUsername());
        return notifications;
    }
    
    /**
     * Get count of unread notifications for a user
     */
    public Long getUnreadNotificationCount(User user) {
        logger.info("📊 Counting unread notifications for user: {} (ID: {})", user.getUsername(), user.getId());
        Long count = notificationRepository.countByUserAndIsReadFalse(user);
        logger.info("✅ Unread count: {} for user: {}", count, user.getUsername());
        return count;
    }
    
    /**
     * Mark a specific notification as read
     */
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
                logger.info("✅ Marked notification {} as read", notificationId);
            }
        });
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllNotificationsAsRead(User user) {
        List<Notification> unreadNotifications = 
            notificationRepository.findByUserAndIsReadFalse(user);
        
        if (!unreadNotifications.isEmpty()) {
            for (Notification notification : unreadNotifications) {
                notification.setRead(true);
            }
            
            notificationRepository.saveAll(unreadNotifications);
            logger.info("✅ Marked {} notifications as read for user {}", 
                        unreadNotifications.size(), user.getUsername());
        }
    }
    
    /**
     * Delete all notifications related to a post (called when post is deleted)
     */
    @Transactional
    public void deleteNotificationsByPost(Long postId) {
        try {
            notificationRepository.deleteByRelatedPostId(postId);
            logger.info("🗑️ Deleted all notifications for post {}", postId);
        } catch (Exception e) {
            logger.error("❌ Failed to delete notifications for post {}: {}", postId, e.getMessage());
        }
    }
    
    /**
     * Delete all notifications for a user (called when user account is deleted)
     */
    @Transactional
    public void deleteNotificationsByUser(User user) {
        try {
            notificationRepository.deleteByUser(user);
            logger.info("🗑️ Deleted all notifications for user {}", user.getUsername());
        } catch (Exception e) {
            logger.error("❌ Failed to delete notifications for user {}: {}", 
                        user.getUsername(), e.getMessage());
        }
    }
}
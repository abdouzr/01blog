// backend/src/main/java/com/zerooneblog/repository/NotificationRepository.java
package com.zerooneblog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zerooneblog.model.Notification;
import com.zerooneblog.model.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find all notifications for a user, ordered by creation date (newest first)
     */
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find only unread notifications for a user, ordered by creation date
     */
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    /**
     * Find unread notifications without ordering (for batch operations)
     */
    List<Notification> findByUserAndIsReadFalse(User user);
    
    /**
     * Count unread notifications for a user
     */
    Long countByUserAndIsReadFalse(User user);
    
    /**
     * Delete all notifications for a specific user (useful for account deletion)
     */
    void deleteByUser(User user);
    
    /**
     * Delete all notifications related to a specific post
     * (useful when a post is deleted)
     */
    void deleteByRelatedPostId(Long postId);
}
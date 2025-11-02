// backend/src/main/java/com/zerooneblog/controller/TestNotificationController.java
package com.zerooneblog.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.model.Notification;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.NotificationRepository;
import com.zerooneblog.repository.PostRepository;
import com.zerooneblog.repository.UserRepository;
import com.zerooneblog.service.NotificationService;
import com.zerooneblog.service.UserService;

/**
 * TEST CONTROLLER - Remove this after debugging is complete
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class TestNotificationController {

    private static final Logger logger = LoggerFactory.getLogger(TestNotificationController.class);

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PostRepository postRepository;

    /**
     * Test if notification service is working
     */
    @GetMapping("/notification-service-status")
    public ResponseEntity<?> testNotificationService() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = userService.getCurrentUser();
            response.put("notificationServiceExists", notificationService != null);
            response.put("currentUser", currentUser.getUsername());
            response.put("currentUserId", currentUser.getId());
            
            // Test getting notifications
            List<Notification> notifications = notificationService.getNotificationsByUser(currentUser);
            response.put("notificationCount", notifications.size());
            
            // Get unread count
            Long unreadCount = notificationService.getUnreadNotificationCount(currentUser);
            response.put("unreadCount", unreadCount);
            
            response.put("status", "OK");
            
            logger.info("✅ Notification service test: OK");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            logger.error("❌ Notification service test failed: {}", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * Manually trigger notification creation for a specific post
     */
    @PostMapping("/create-notifications-for-post/{postId}")
    public ResponseEntity<?> manuallyCreateNotifications(@PathVariable Long postId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🧪 Manually creating notifications for post: {}", postId);
            
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
            
            logger.info("📝 Found post by: {}", post.getAuthor().getUsername());
            logger.info("📊 Author has {} subscribers", post.getAuthor().getSubscribers().size());
            
            // Manually trigger notification creation
            notificationService.createNewPostNotification(post);
            
            response.put("status", "OK");
            response.put("message", "Notifications created successfully");
            response.put("postId", postId);
            response.put("author", post.getAuthor().getUsername());
            response.put("subscriberCount", post.getAuthor().getSubscribers().size());
            
            logger.info("✅ Manual notification creation completed");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            logger.error("❌ Manual notification creation failed: {}", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * Get all notifications in the database (for debugging)
     */
    @GetMapping("/all-notifications")
    public ResponseEntity<?> getAllNotifications() {
        try {
            List<Notification> notifications = notificationRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", notifications.size());
            response.put("notifications", notifications.stream().map(n -> {
                Map<String, Object> notifMap = new HashMap<>();
                notifMap.put("id", n.getId());
                notifMap.put("message", n.getMessage());
                notifMap.put("type", n.getType());
                notifMap.put("isRead", n.isRead());
                notifMap.put("createdAt", n.getCreatedAt());
                notifMap.put("receiver", n.getUser().getUsername());
                notifMap.put("sender", n.getFromUser() != null ? n.getFromUser().getUsername() : null);
                notifMap.put("postId", n.getRelatedPost() != null ? n.getRelatedPost().getId() : null);
                return notifMap;
            }).toList());
            
            logger.info("📊 Total notifications in database: {}", notifications.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            logger.error("❌ Error fetching all notifications: {}", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * Check user subscription status
     */
    @GetMapping("/subscription-status/{username}")
    public ResponseEntity<?> checkSubscriptionStatus(@PathVariable String username) {
        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("userId", user.getId());
            response.put("subscriberCount", user.getSubscribers().size());
            response.put("subscribingToCount", user.getSubscribedTo().size());
            
            response.put("subscribers", user.getSubscribers().stream()
                .map(sub -> sub.getSubscriber().getUsername())
                .toList());
            
            response.put("subscribedTo", user.getSubscribedTo().stream()
                .map(User::getUsername)
                .toList());
            
            logger.info("📊 User {} has {} subscribers", username, user.getSubscribers().size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
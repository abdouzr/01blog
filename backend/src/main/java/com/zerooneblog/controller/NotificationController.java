// backend/src/main/java/com/zerooneblog/controller/NotificationController.java
package com.zerooneblog.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.NotificationResponse;
import com.zerooneblog.model.Notification;
import com.zerooneblog.model.User;
import com.zerooneblog.service.NotificationService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        User currentUser = userService.getCurrentUser();
        List<Notification> notifications = notificationService.getNotificationsByUser(currentUser);
        
        List<NotificationResponse> responses = notifications.stream()
            .map(this::convertToNotificationResponse)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        User currentUser = userService.getCurrentUser();
        List<Notification> notifications = notificationService.getUnreadNotificationsByUser(currentUser);
        
        List<NotificationResponse> responses = notifications.stream()
            .map(this::convertToNotificationResponse)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadNotificationCount() {
        User currentUser = userService.getCurrentUser();
        Long count = notificationService.getUnreadNotificationCount(currentUser);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllNotificationsAsRead() {
        User currentUser = userService.getCurrentUser();
        notificationService.markAllNotificationsAsRead(currentUser);
        return ResponseEntity.ok().build();
    }

    private NotificationResponse convertToNotificationResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        response.setType(notification.getType().toString().toLowerCase());
        
        if (notification.getRelatedPost() != null) {
            response.setRelatedPostId(notification.getRelatedPost().getId());
        }
        
        if (notification.getFromUser() != null) {
            NotificationResponse.FromUser fromUser = new NotificationResponse.FromUser();
            fromUser.setId(notification.getFromUser().getId());
            fromUser.setUsername(notification.getFromUser().getUsername());
            fromUser.setProfilePicture(notification.getFromUser().getProfilePicture());
            response.setFromUser(fromUser);
        }
        
        return response;
    }
}
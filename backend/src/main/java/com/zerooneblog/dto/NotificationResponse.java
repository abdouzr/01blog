// backend/src/main/java/com/zerooneblog/dto/NotificationResponse.java
package com.zerooneblog.dto;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String type;
    private Long relatedPostId;
    private FromUser fromUser;

    public static class FromUser {
        private Long id;
        private String username;
        private String profilePicture;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getProfilePicture() { return profilePicture; }
        public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Long getRelatedPostId() { return relatedPostId; }
    public void setRelatedPostId(Long relatedPostId) { this.relatedPostId = relatedPostId; }
    
    public FromUser getFromUser() { return fromUser; }
    public void setFromUser(FromUser fromUser) { this.fromUser = fromUser; }
}

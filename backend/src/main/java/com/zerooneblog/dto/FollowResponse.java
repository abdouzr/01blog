// backend/src/main/java/com/zerooneblog/dto/FollowResponse.java
package com.zerooneblog.dto;

import java.time.LocalDateTime;

public class FollowResponse {
    private Long id;
    private UserResponse follower;
    private UserResponse following;
    private LocalDateTime createdAt;

    public static class UserResponse {
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

    public UserResponse getFollower() { return follower; }
    public void setFollower(UserResponse follower) { this.follower = follower; }

    public UserResponse getFollowing() { return following; }
    public void setFollowing(UserResponse following) { this.following = following; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
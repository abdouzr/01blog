// backend/src/main/java/com/zerooneblog/dto/UserResponse.java
package com.zerooneblog.dto;

import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String profilePicture;
    private LocalDateTime createdAt;
    private Long followerCount;
    private Long followingCount;
    private Boolean isFollowedByCurrentUser;

    public UserResponse() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Long getFollowerCount() { return followerCount; }
    public void setFollowerCount(Long followerCount) { this.followerCount = followerCount; }
    
    public Long getFollowingCount() { return followingCount; }
    public void setFollowingCount(Long followingCount) { this.followingCount = followingCount; }
    
    public Boolean getIsFollowedByCurrentUser() { return isFollowedByCurrentUser; }
    public void setIsFollowedByCurrentUser(Boolean isFollowedByCurrentUser) { this.isFollowedByCurrentUser = isFollowedByCurrentUser; }
}


// backend/src/main/java/com/zerooneblog/dto/PostResponse.java
package com.zerooneblog.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PostResponse {
    private Long id;
    private String content;
    private List<String> mediaUrls = new ArrayList<>();
    private List<String> mediaTypes = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long authorId;
    private String authorUsername;
    private String authorProfilePicture;
    private Long likeCount;
    private Long commentCount;
    private boolean likedByCurrentUser;

    // Constructors
    public PostResponse() {}

    public PostResponse(Long id, String content, List<String> mediaUrls, List<String> mediaTypes, 
            LocalDateTime createdAt, LocalDateTime updatedAt, Long authorId, 
            String authorUsername, String authorProfilePicture, Long likeCount, 
            Long commentCount, boolean likedByCurrentUser) {
        this.id = id;
        this.content = content;
        this.mediaUrls = mediaUrls;
        this.mediaTypes = mediaTypes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorProfilePicture = authorProfilePicture;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.likedByCurrentUser = likedByCurrentUser;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public List<String> getMediaUrls() { return mediaUrls; }
    public void setMediaUrls(List<String> mediaUrls) { this.mediaUrls = mediaUrls; }
    
    public List<String> getMediaTypes() { return mediaTypes; }
    public void setMediaTypes(List<String> mediaTypes) { this.mediaTypes = mediaTypes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    
    public String getAuthorProfilePicture() { return authorProfilePicture; }
    public void setAuthorProfilePicture(String authorProfilePicture) { this.authorProfilePicture = authorProfilePicture; }
    
    public Long getLikeCount() { return likeCount; }
    public void setLikeCount(Long likeCount) { this.likeCount = likeCount; }
    
    public Long getCommentCount() { return commentCount; }
    public void setCommentCount(Long commentCount) { this.commentCount = commentCount; }
    
    public boolean isLikedByCurrentUser() { return likedByCurrentUser; }
    public void setLikedByCurrentUser(boolean likedByCurrentUser) { this.likedByCurrentUser = likedByCurrentUser; }
}
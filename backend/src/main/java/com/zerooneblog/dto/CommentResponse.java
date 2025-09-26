// backend/src/main/java/com/zerooneblog/dto/CommentResponse.java
package com.zerooneblog.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long authorId;
    private String authorUsername;
    private String authorProfilePicture;
    private Long postId;

    public CommentResponse() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    
    public String getAuthorProfilePicture() { return authorProfilePicture; }
    public void setAuthorProfilePicture(String authorProfilePicture) { this.authorProfilePicture = authorProfilePicture; }
    
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
}
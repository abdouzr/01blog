// backend/src/main/java/com/zerooneblog/dto/ReportResponse.java
package com.zerooneblog.dto;

import java.time.LocalDateTime;

public class ReportResponse {
    private Long id;
    private String reportType;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    
    // Reporter information
    private Long reporterId;
    private String reporterUsername;
    
    // Reported content information
    private Long reportedEntityId;
    private String reportedEntityType; // "POST", "COMMENT", "USER"
    private String reportedEntityContent; // Preview of the content
    
    // Post details (if applicable)
    private Long postId;
    private String postContent;
    private String postAuthorUsername;
    
    // Comment details (if applicable)
    private Long commentId;
    private String commentContent;
    private String commentAuthorUsername;
    
    // Reported user details (if applicable)
    private Long reportedUserId;
    private String reportedUsername;

    public ReportResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Long getReporterId() { return reporterId; }
    public void setReporterId(Long reporterId) { this.reporterId = reporterId; }
    
    public String getReporterUsername() { return reporterUsername; }
    public void setReporterUsername(String reporterUsername) { this.reporterUsername = reporterUsername; }
    
    public Long getReportedEntityId() { return reportedEntityId; }
    public void setReportedEntityId(Long reportedEntityId) { this.reportedEntityId = reportedEntityId; }
    
    public String getReportedEntityType() { return reportedEntityType; }
    public void setReportedEntityType(String reportedEntityType) { this.reportedEntityType = reportedEntityType; }
    
    public String getReportedEntityContent() { return reportedEntityContent; }
    public void setReportedEntityContent(String reportedEntityContent) { this.reportedEntityContent = reportedEntityContent; }
    
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    
    public String getPostContent() { return postContent; }
    public void setPostContent(String postContent) { this.postContent = postContent; }
    
    public String getPostAuthorUsername() { return postAuthorUsername; }
    public void setPostAuthorUsername(String postAuthorUsername) { this.postAuthorUsername = postAuthorUsername; }
    
    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }
    
    public String getCommentContent() { return commentContent; }
    public void setCommentContent(String commentContent) { this.commentContent = commentContent; }
    
    public String getCommentAuthorUsername() { return commentAuthorUsername; }
    public void setCommentAuthorUsername(String commentAuthorUsername) { this.commentAuthorUsername = commentAuthorUsername; }
    
    public Long getReportedUserId() { return reportedUserId; }
    public void setReportedUserId(Long reportedUserId) { this.reportedUserId = reportedUserId; }
    
    public String getReportedUsername() { return reportedUsername; }
    public void setReportedUsername(String reportedUsername) { this.reportedUsername = reportedUsername; }
}
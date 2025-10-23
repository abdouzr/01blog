// backend/src/main/java/com/zerooneblog/dto/ReportRequest.java
package com.zerooneblog.dto;

public class ReportRequest {
    private String targetType; // "POST" or "USER"
    private Long targetId;
    private String reason;
    
    // Getters and Setters

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
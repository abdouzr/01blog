// backend/src/main/java/com/zerooneblog/dto/CommentRequest.java
package com.zerooneblog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequest {
    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String content;

    public CommentRequest() {}

    public CommentRequest(String content) {
        this.content = content;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}


// backend/src/main/java/com/zerooneblog/dto/PostRequest.java
package com.zerooneblog.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PostRequest {
    
    @NotBlank(message = "Content cannot be empty")
    @Size(max = 5000, message = "Content cannot exceed 5000 characters")
    private String content;
    
    private List<String> mediaUrls = new ArrayList<>();
    private List<String> mediaTypes = new ArrayList<>();
    private List<String> cloudinaryPublicIds = new ArrayList<>();

    // Constructors
    public PostRequest() {}

    public PostRequest(String content, List<String> mediaUrls, List<String> mediaTypes, List<String> cloudinaryPublicIds) {
        this.content = content;
        this.mediaUrls = mediaUrls;
        this.mediaTypes = mediaTypes;
        this.cloudinaryPublicIds = cloudinaryPublicIds;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public List<String> getMediaTypes() {
        return mediaTypes;
    }

    public void setMediaTypes(List<String> mediaTypes) {
        this.mediaTypes = mediaTypes;
    }

    public List<String> getCloudinaryPublicIds() {
        return cloudinaryPublicIds;
    }

    public void setCloudinaryPublicIds(List<String> cloudinaryPublicIds) {
        this.cloudinaryPublicIds = cloudinaryPublicIds;
    }

    // Helper methods
    public void addMedia(String url, String type, String publicId) {
        this.mediaUrls.add(url);
        this.mediaTypes.add(type);
        this.cloudinaryPublicIds.add(publicId);
    }
}
// backend/src/main/java/com/zerooneblog/dto/PostRequest.java
package com.zerooneblog.dto;

public class PostRequest {
    private String content;
    private String mediaUrl;
    private String mediaType;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }
}
// backend/src/main/java/com/zerooneblog/dto/JwtResponse.java
package com.zerooneblog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class JwtResponse {
    @JsonProperty("token")
    private String accessToken;
    
    @JsonProperty("type")
    private String tokenType = "Bearer";
    
    private Long id;
    private String username;
    private String email;
    private String role;

    public JwtResponse(String accessToken, Long id, String username, String email, String role) {
        this.accessToken = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    // Getters
    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    // Setters
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
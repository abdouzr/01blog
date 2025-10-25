// FIXED FILE: /com/zerooneblog/model/User.java
package com.zerooneblog.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... (no changes to id, username, email, password, role, bio, profilePicture, isBlocked, createdAt) ...
    @Column(length = 20, unique = true, nullable = false)
    private String username;

    @Column(length = 50, unique = true, nullable = false)
    private String email;

    @Column(length = 120, nullable = false)
    private String password;

    @Column(name = "role", length = 20, nullable = false)
    private String role = "ROLE_USER";

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_picture", length = 255)
    private String profilePicture;

    @Column(name = "is_blocked", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isBlocked = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();


    // --- FIXED: Added @JsonIgnore to prevent infinite loops ---
    // Users who subscribe to this user (Followers)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_subscriptions",
        joinColumns = @JoinColumn(name = "subscribed_to_id"),
        inverseJoinColumns = @JoinColumn(name = "subscriber_id")
    )
    @JsonIgnore // <-- This prevents the loop
    private Set<User> subscribers = new HashSet<>();

    // Users this user subscribes to (Following)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_subscriptions",
        joinColumns = @JoinColumn(name = "subscriber_id"),
        inverseJoinColumns = @JoinColumn(name = "subscribed_to_id")
    )
    @JsonIgnore // <-- This prevents the loop
    private Set<User> subscribedTo = new HashSet<>();
    
    // --- Constructors (No Changes) ---
    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = "ROLE_USER";
    }

    // --- Getters and Setters (No Changes) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; } 
    public void setRole(String role) { this.role = role; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public Boolean getIsBlocked() { return isBlocked; }
    public void setIsBlocked(Boolean isBlocked) { this.isBlocked = isBlocked; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Set<User> getSubscribers() { return subscribers; }
    public void setSubscribers(Set<User> subscribers) { this.subscribers = subscribers; }
    public Set<User> getSubscribedTo() { return subscribedTo; }
    public void setSubscribedTo(Set<User> subscribedTo) { this.subscribedTo = subscribedTo; }
}
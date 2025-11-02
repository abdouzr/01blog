// backend/src/main/java/com/zerooneblog/model/UserSubscription.java

package com.zerooneblog.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "user_subscriptions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"subscriber_id", "subscribed_to_id"})
)
public class UserSubscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private User subscriber; // The user who is following
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscribed_to_id", nullable = false)
    private User subscribedTo; // The user being followed
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public UserSubscription() {}
    
    public UserSubscription(User subscriber, User subscribedTo) {
        this.subscriber = subscriber;
        this.subscribedTo = subscribedTo;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getSubscriber() {
        return subscriber;
    }
    
    public void setSubscriber(User subscriber) {
        this.subscriber = subscriber;
    }
    
    public User getSubscribedTo() {
        return subscribedTo;
    }
    
    public void setSubscribedTo(User subscribedTo) {
        this.subscribedTo = subscribedTo;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
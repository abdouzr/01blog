// backend/src/main/java/com/zerooneblog/model/Post.java
package com.zerooneblog.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String content;

    // FIXED: Each collection now has its own separate table
    @ElementCollection(fetch = FetchType.EAGER) // Changed to EAGER to ensure loading
    @CollectionTable(name = "post_media_urls", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_url", length = 500)
    @OrderColumn(name = "url_order") // Maintains order of URLs
    private List<String> mediaUrls = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER) // Changed to EAGER
    @CollectionTable(name = "post_media_types", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_type", length = 50)
    @OrderColumn(name = "type_order") // Maintains order of types
    private List<String> mediaTypes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER) // Changed to EAGER
    @CollectionTable(name = "post_cloudinary_ids", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "cloudinary_public_id", length = 255)
    @OrderColumn(name = "id_order") // Maintains order of IDs
    private List<String> cloudinaryPublicIds = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User author;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<Like> likes = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Post() {}

    public Post(String content, User author) {
        this.content = content;
        this.author = author;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    // Media collections - return empty lists instead of null
    public List<String> getMediaUrls() { 
        return mediaUrls != null ? mediaUrls : new ArrayList<>(); 
    }
    public void setMediaUrls(List<String> mediaUrls) { 
        this.mediaUrls = mediaUrls != null ? mediaUrls : new ArrayList<>(); 
    }
    
    public List<String> getMediaTypes() { 
        return mediaTypes != null ? mediaTypes : new ArrayList<>(); 
    }
    public void setMediaTypes(List<String> mediaTypes) { 
        this.mediaTypes = mediaTypes != null ? mediaTypes : new ArrayList<>(); 
    }
    
    public List<String> getCloudinaryPublicIds() { 
        return cloudinaryPublicIds != null ? cloudinaryPublicIds : new ArrayList<>(); 
    }
    public void setCloudinaryPublicIds(List<String> cloudinaryPublicIds) { 
        this.cloudinaryPublicIds = cloudinaryPublicIds != null ? cloudinaryPublicIds : new ArrayList<>(); 
    }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    
    public Set<Comment> getComments() { return comments; }
    public void setComments(Set<Comment> comments) { this.comments = comments; }
    
    public Set<Like> getLikes() { return likes; }
    public void setLikes(Set<Like> likes) { this.likes = likes; }

    // Helper methods
    public void addMedia(String url, String type, String publicId) {
        if (this.mediaUrls == null) this.mediaUrls = new ArrayList<>();
        if (this.mediaTypes == null) this.mediaTypes = new ArrayList<>();
        if (this.cloudinaryPublicIds == null) this.cloudinaryPublicIds = new ArrayList<>();
        
        this.mediaUrls.add(url);
        this.mediaTypes.add(type);
        this.cloudinaryPublicIds.add(publicId);
    }

    public void clearMedia() {
        if (this.mediaUrls != null) this.mediaUrls.clear();
        if (this.mediaTypes != null) this.mediaTypes.clear();
        if (this.cloudinaryPublicIds != null) this.cloudinaryPublicIds.clear();
    }
    
    @Override
    public String toString() {
        return "Post{id=" + id + ", content='" + content + "', mediaCount=" + 
               (mediaUrls != null ? mediaUrls.size() : 0) + "}";
    }
}
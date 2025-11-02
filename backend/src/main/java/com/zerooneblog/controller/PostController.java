// backend/src/main/java/com/zerooneblog/controller/PostController.java
package com.zerooneblog.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.PostRequest;
import com.zerooneblog.dto.PostResponse;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.security.PostSecurity;
import com.zerooneblog.service.PostService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private PostSecurity postSecurity;

    /**
     * Get all posts
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        User currentUser = userService.getCurrentUser();
        logger.info("📥 Fetching all posts for user: {}", currentUser.getUsername());
        
        List<Post> posts = postService.getAllPosts();
        List<PostResponse> responses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        
        logger.info("✅ Returning {} posts", responses.size());
        return ResponseEntity.ok(responses);
    }

    /**
     * Get feed (posts from followed users + own posts)
     */
    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        User currentUser = userService.getCurrentUser();
        logger.info("📰 Fetching feed for user: {}", currentUser.getUsername());
        
        List<Post> posts;
        
        // Get list of followed users
        List<User> followedUsers = currentUser.getSubscribedTo().stream().collect(Collectors.toList());
        followedUsers.add(currentUser); // Include current user's own posts
        
        if (followedUsers.isEmpty()) {
            // If not following anyone, show only own posts
            posts = postService.getPostsByUser(currentUser);
        } else {
            // Show posts from followed users + own posts
            posts = postService.getPostsFromSubscribedUsers(followedUsers);
        }
        
        List<PostResponse> responses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        
        logger.info("✅ Returning {} posts in feed", responses.size());
        return ResponseEntity.ok(responses);
    }

    /**
     * Get posts by a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId) {
        User currentUser = userService.getCurrentUser();
        logger.info("📥 Fetching posts for user ID: {}", userId);
        
        Optional<User> targetUser = userService.getUserById(userId);
        
        if (targetUser.isEmpty()) {
            logger.warn("⚠️ User not found with ID: {}", userId);
            return ResponseEntity.notFound().build();
        }
        
        List<Post> posts = postService.getPostsByUser(targetUser.get());
        List<PostResponse> responses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        
        logger.info("✅ Returning {} posts for user {}", responses.size(), targetUser.get().getUsername());
        return ResponseEntity.ok(responses);
    }

    /**
     * Get a single post by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        logger.info("📥 Fetching post with ID: {}", id);
        
        return postService.getPostById(id)
                .map(post -> {
                    PostResponse response = postService.convertToPostResponse(post, currentUser);
                    logger.info("✅ Found post with ID: {}", id);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    logger.warn("⚠️ Post not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Create a new post
     * IMPORTANT: This triggers notifications to all followers
     */
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostRequest postRequest) {
        User currentUser = userService.getCurrentUser();
        
        logger.info("📝 Creating post for user: {}", currentUser.getUsername());
        
        try {
            // Create the post entity
            Post post = new Post();
            post.setContent(postRequest.getContent());
            post.setMediaUrl(postRequest.getMediaUrl());
            post.setMediaType(postRequest.getMediaType());
            post.setAuthor(currentUser);
            post.setCreatedAt(LocalDateTime.now());
            post.setUpdatedAt(LocalDateTime.now());

            // Save the post (this will trigger notifications in PostService)
            Post savedPost = postService.createPost(post);
            logger.info("✅ Post created successfully with ID: {}", savedPost.getId());
            
            // Convert to response DTO
            PostResponse response = postService.convertToPostResponse(savedPost, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("❌ Error creating post: {}", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating post: " + e.getMessage());
        }
    }

    /**
     * Update an existing post
     */
    @PutMapping("/{id}")
    @PreAuthorize("@postSecurity.isPostOwner(#id)")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @RequestBody PostRequest postRequest) {
        User currentUser = userService.getCurrentUser();
        
        logger.info("✏️ Updating post {} for user: {}", id, currentUser.getUsername());
        
        return postService.getPostById(id)
                .map(post -> {
                    post.setContent(postRequest.getContent());
                    post.setMediaUrl(postRequest.getMediaUrl());
                    post.setMediaType(postRequest.getMediaType());
                    post.setUpdatedAt(LocalDateTime.now());
                    
                    Post updatedPost = postService.updatePost(post);
                    PostResponse response = postService.convertToPostResponse(updatedPost, currentUser);
                    
                    logger.info("✅ Post {} updated successfully", id);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    logger.warn("⚠️ Post not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Delete a post
     * IMPORTANT: This also deletes all related notifications
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("@postSecurity.isPostOwner(#id) or hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        logger.info("🗑️ Deleting post {}", id);
        
        try {
            // This will delete the post and all related notifications
            postService.deletePost(id);
            logger.info("✅ Post {} deleted successfully", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("❌ Error deleting post {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting post: " + e.getMessage());
        }
    }
}
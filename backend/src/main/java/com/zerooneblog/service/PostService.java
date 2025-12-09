// backend/src/main/java/com/zerooneblog/service/PostService.java
package com.zerooneblog.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.dto.PostResponse;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.PostRepository;

@Service
public class PostService {
    
    private static final Logger logger = LoggerFactory.getLogger(PostService.class);
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private LikeService likeService;
    
    @Autowired
    private CommentService commentService;
    
    /**
     * Create a new post and send notifications to followers
     */
    @Transactional
    public Post createPost(Post post) {
        logger.info("💾 Saving post to database...");
        Post savedPost = postRepository.save(post);
        logger.info("✅ Post saved with ID: {}", savedPost.getId());
        
        // 🚨 CRITICAL: Create notifications for all followers
        logger.info("🔔 About to create notifications for followers...");
        try {
            notificationService.createNewPostNotification(savedPost);
            logger.info("✅ Notification creation completed");
        } catch (Exception e) {
            logger.error("❌ FAILED to create notifications: {}", e.getMessage());
            e.printStackTrace();
            // Don't fail the post creation if notifications fail
        }
        
        return savedPost;
    }
    
    /**
     * Update an existing post
     */
    @Transactional
    public Post updatePost(Post post) {
        Post updatedPost = postRepository.save(post);
        logger.info("✅ Post {} updated successfully", updatedPost.getId());
        return updatedPost;
    }
    
    /**
     * Delete a post and its related notifications
     */
    @Transactional
    public void deletePost(Long postId) {
        logger.info("🗑️ Deleting post with ID: {}", postId);
        
        // First, delete all notifications related to this post
        try {
            notificationService.deleteNotificationsByPost(postId);
            logger.info("✅ Deleted notifications for post {}", postId);
        } catch (Exception e) {
            logger.error("⚠️ Failed to delete notifications for post {}: {}", postId, e.getMessage());
        }
        
        // Then delete the post (this will cascade delete comments and likes due to JPA mappings)
        postRepository.deleteById(postId);
        logger.info("✅ Post {} deleted successfully", postId);
    }

    // ✅ NEW: Hide a post (admin only)
    @Transactional
    public void hidePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setHidden(true);
        postRepository.save(post);
        logger.info("✅ Post {} has been hidden", postId);
    }

    // ✅ NEW: Unhide a post (admin only)
    @Transactional
    public void unhidePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setHidden(false);
        postRepository.save(post);
        logger.info("✅ Post {} has been unhidden", postId);
    }
    
    /**
     * Get post by ID
     */
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }
    
    /**
     * Get all posts
     */
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }
    
    /**
     * Get posts by a specific user
     */
    public List<Post> getPostsByUser(User user) {
        return postRepository.findByAuthorOrderByCreatedAtDesc(user);
    }
    
    /**
     * Get posts from subscribed users (for feed)
     */
    public List<Post> getPostsFromSubscribedUsers(List<User> users) {
        return postRepository.findByAuthorInOrderByCreatedAtDesc(users);
    }
    
    /**
     * Convert Post entity to PostResponse DTO
     * ✅ UPDATED: Now includes isHidden field
     */
    public PostResponse convertToPostResponse(Post post, User currentUser) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setMediaUrls(post.getMediaUrls());
        response.setMediaTypes(post.getMediaTypes());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());
        
        // Author information
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorUsername(post.getAuthor().getUsername());
        response.setAuthorProfilePicture(post.getAuthor().getProfilePicture());
        
        // Like and comment counts
        response.setLikeCount(likeService.getLikeCount(post));
        response.setCommentCount((long) post.getComments().size());
        
        // Check if current user liked this post
        response.setLikedByCurrentUser(likeService.hasUserLikedPost(post, currentUser));
        
        // ✅ NEW: Include hidden status
        response.setHidden(post.isHidden());
        
        return response;
    }
}
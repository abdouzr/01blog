// backend/src/main/java/com/zerooneblog/service/LikeService.java
package com.zerooneblog.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Like;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.LikeRepository;

@Service
public class LikeService {
    
    private static final Logger logger = LoggerFactory.getLogger(LikeService.class);
    
    @Autowired
    private LikeRepository likeRepository;
    
    /**
     * Like a post
     */
    @Transactional
    public void likePost(Post post, User user) {
        // FIXED: Changed from findByPostAndUser to findByUserAndPost
        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);
        
        if (existingLike.isEmpty()) {
            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            like.setCreatedAt(LocalDateTime.now());
            
            likeRepository.save(like);
            logger.info("❤️ User {} liked post {}", user.getUsername(), post.getId());
        }
    }
    
    /**
     * Unlike a post
     */
    @Transactional
    public void unlikePost(Post post, User user) {
        // FIXED: Changed from findByPostAndUser to findByUserAndPost
        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);
        
        existingLike.ifPresent(like -> {
            likeRepository.delete(like);
            logger.info("💔 User {} unliked post {}", user.getUsername(), post.getId());
        });
    }
    
    /**
     * Check if a user has liked a post
     */
    public boolean hasUserLikedPost(Post post, User user) {
        // FIXED: Changed from findByPostAndUser to findByUserAndPost
        return likeRepository.findByUserAndPost(user, post).isPresent();
    }
    
    /**
     * Get the number of likes for a post
     */
    public Long getLikeCount(Post post) {
        try {
            Long count = likeRepository.countByPost(post);
            return count != null ? count : 0L;
        } catch (Exception e) {
            logger.error("Error getting like count for post {}: {}", post.getId(), e.getMessage());
            return 0L;
        }
    }
    
    /**
     * Like a post by IDs (for LikeController)
     */
    @Transactional
    public void likePost(Long postId, Long userId) {
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingLike.isEmpty()) {
            Like like = new Like();
            like.setPost(new Post());
            like.getPost().setId(postId);
            like.setUser(new User());
            like.getUser().setId(userId);
            like.setCreatedAt(LocalDateTime.now());
            
            likeRepository.save(like);
            logger.info("❤️ User ID {} liked post ID {}", userId, postId);
        }
    }
    
    /**
     * Unlike a post by IDs (for LikeController)
     */
    @Transactional
    public void unlikePost(Long postId, Long userId) {
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        
        existingLike.ifPresent(like -> {
            likeRepository.delete(like);
            logger.info("💔 User ID {} unliked post ID {}", userId, postId);
        });
    }
}
package com.zerooneblog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Like;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    // Find a specific like by user and post
    Optional<Like> findByUserAndPost(User user, Post post);
    
    // Check if a like exists
    boolean existsByUserAndPost(User user, Post post);
    
    // Count likes for a post
    Long countByPost(Post post);
    
    // Count likes by post ID
    Long countByPostId(Long postId);
    
    // Find all likes for a post
    List<Like> findByPost(Post post);
    
    // Find all likes by a user
    List<Like> findByUser(User user);
    
    // Find like by post ID and user ID
    Optional<Like> findByPostIdAndUserId(Long postId, Long userId);
    
    // Delete all likes by a user (for cascade delete)
    @Modifying
    @Transactional
    @Query("DELETE FROM Like l WHERE l.user = :user")
    void deleteByUser(@Param("user") User user);
}
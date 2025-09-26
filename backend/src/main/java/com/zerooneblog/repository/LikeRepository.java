// backend/src/main/java/com/zerooneblog/repository/LikeRepository.java
package com.zerooneblog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zerooneblog.model.Like;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    List<Like> findByPost(Post post);
    List<Like> findByUser(User user);
    Long countByPost(Post post);
    boolean existsByUserAndPost(User user, Post post);
    
    @Query("SELECT l FROM Like l WHERE l.post.id = :postId AND l.user.id = :userId")
    Optional<Like> findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.post.id = :postId")
    Long countByPostId(@Param("postId") Long postId);
}
package com.zerooneblog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Comment;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);
    
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.author = :user")
    void deleteByUser(@Param("user") User user);
}
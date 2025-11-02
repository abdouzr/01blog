package com.zerooneblog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthorOrderByCreatedAtDesc(User author);
    
    @Query("SELECT p FROM Post p WHERE p.author IN :users ORDER BY p.createdAt DESC")
    List<Post> findByAuthorsOrderByCreatedAtDesc(@Param("users") List<User> users);
    
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllOrderByCreatedAtDesc();
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Post p WHERE p.author = :author")
    void deleteByAuthor(@Param("author") User author);



    /**
     * Find all posts ordered by creation date (newest first)
     */
    List<Post> findAllByOrderByCreatedAtDesc();
    
    /**
     * Find posts by multiple authors (for feed), ordered by creation date
     */
    List<Post> findByAuthorInOrderByCreatedAtDesc(List<User> authors);
}
// backend/src/main/java/com/zerooneblog/repository/PostRepository.java
package com.zerooneblog.repository;

import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthorOrderByCreatedAtDesc(User author);
    
    @Query("SELECT p FROM Post p WHERE p.author IN :users ORDER BY p.createdAt DESC")
    List<Post> findByAuthorsOrderByCreatedAtDesc(@Param("users") List<User> users);
    
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllOrderByCreatedAtDesc();
}
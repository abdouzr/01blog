// backend/src/main/java/com/zerooneblog/repository/CommentRepository.java
package com.zerooneblog.repository;

import com.zerooneblog.model.Comment;
import com.zerooneblog.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);
}
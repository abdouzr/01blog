// backend/src/main/java/com/zerooneblog/repository/LikeRepository.java
package com.zerooneblog.repository;

import com.zerooneblog.model.Like;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    Long countByPost(Post post);
}
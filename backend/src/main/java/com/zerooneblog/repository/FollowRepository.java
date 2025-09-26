// backend/src/main/java/com/zerooneblog/repository/FollowRepository.java
package com.zerooneblog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zerooneblog.model.Follow;
import com.zerooneblog.model.User;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowing(User following);
    Long countByFollowing(User following); // Followers count
    Long countByFollower(User follower);   // Following count
    boolean existsByFollowerAndFollowing(User follower, User following);
    
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :followerId AND f.following.id = :followingId")
    Optional<Follow> findByFollowerIdAndFollowingId(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
}
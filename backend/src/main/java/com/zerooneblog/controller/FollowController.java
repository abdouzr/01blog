// Fixed FollowController.java - Remove notification call
package com.zerooneblog.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.FollowResponse;
import com.zerooneblog.model.User;
import com.zerooneblog.service.FollowService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FollowController {

    @Autowired
    private FollowService followService;

    @Autowired
    private UserService userService;

    // Removed NotificationService injection - we only notify on posts now

    @PostMapping("/follow/{userId}")
    public ResponseEntity<?> followUser(@PathVariable Long userId) {
        try {
            User currentUser = userService.getCurrentUser();
            Optional<User> userToFollow = userService.getUserById(userId);
            
            if (!userToFollow.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            followService.followUser(currentUser.getId(), userId);
            
            // Removed notification creation - notifications only for posts from followed users
            
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/unfollow/{userId}")
    public ResponseEntity<?> unfollowUser(@PathVariable Long userId) {
        try {
            User currentUser = userService.getCurrentUser();
            followService.unfollowUser(currentUser.getId(), userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<FollowResponse>> getFollowers(@PathVariable Long userId) {
        try {
            List<FollowResponse> followers = followService.getFollowers(userId);
            return ResponseEntity.ok(followers);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<List<FollowResponse>> getFollowing(@PathVariable Long userId) {
        try {
            List<FollowResponse> following = followService.getFollowing(userId);
            return ResponseEntity.ok(following);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/followers/count/{userId}")
    public ResponseEntity<Long> getFollowerCount(@PathVariable Long userId) {
        try {
            Long count = followService.getFollowerCount(userId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/following/count/{userId}")
    public ResponseEntity<Long> getFollowingCount(@PathVariable Long userId) {
        try {
            Long count = followService.getFollowingCount(userId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/is-following/{userId}")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long userId) {
        try {
            User currentUser = userService.getCurrentUser();
            boolean isFollowing = followService.isFollowing(currentUser.getId(), userId);
            return ResponseEntity.ok(isFollowing);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }
}


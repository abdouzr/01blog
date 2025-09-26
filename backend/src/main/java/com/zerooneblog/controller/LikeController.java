// backend/src/main/java/com/zerooneblog/controller/LikeController.java
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

import com.zerooneblog.dto.LikeResponse;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.service.LikeService;
import com.zerooneblog.service.NotificationService;
import com.zerooneblog.service.PostService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LikeController {

    @Autowired
    private LikeService likeService;

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        try {
            User currentUser = userService.getCurrentUser();
            Optional<Post> post = postService.getPostById(postId);
            
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            likeService.likePost(postId, currentUser.getId());
            
            // Create notification for the post author (if it's not the current user)
            if (!currentUser.getId().equals(post.get().getAuthor().getId())) {
                notificationService.createLikeNotification(currentUser, post.get());
            }
            
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<?> unlikePost(@PathVariable Long postId) {
        try {
            User currentUser = userService.getCurrentUser();
            likeService.unlikePost(postId, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<LikeResponse>> getLikesByPost(@PathVariable Long postId) {
        try {
            List<LikeResponse> likes = likeService.getLikesByPost(postId);
            return ResponseEntity.ok(likes);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LikeResponse>> getUserLikes(@PathVariable Long userId) {
        try {
            List<LikeResponse> likes = likeService.getLikesByUser(userId);
            return ResponseEntity.ok(likes);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
        try {
            Long count = likeService.getLikeCountByPost(postId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/post/{postId}/is-liked")
    public ResponseEntity<Boolean> isPostLiked(@PathVariable Long postId) {
        try {
            User currentUser = userService.getCurrentUser();
            boolean isLiked = likeService.isPostLikedByUser(postId, currentUser.getId());
            return ResponseEntity.ok(isLiked);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }
}
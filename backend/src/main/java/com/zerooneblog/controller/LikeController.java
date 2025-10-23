package com.zerooneblog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.model.User;
import com.zerooneblog.service.LikeService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/posts/{postId}")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LikeController {

    @Autowired
    private LikeService likeService;

    @Autowired
    private UserService userService;

    // POST /api/posts/{postId}/like - Likes a post
    @PostMapping("/like")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        User currentUser = userService.getCurrentUser();
        try {
            likeService.likePost(postId, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/posts/{postId}/like - Unlikes a post
    @DeleteMapping("/like")
    public ResponseEntity<?> unlikePost(@PathVariable Long postId) {
        User currentUser = userService.getCurrentUser();
        try {
            likeService.unlikePost(postId, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

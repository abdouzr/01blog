package com.zerooneblog.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.PostRequest;
import com.zerooneblog.dto.PostResponse;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.security.PostSecurity;
import com.zerooneblog.service.NotificationService; 
import com.zerooneblog.service.PostService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PostSecurity postSecurity;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        User currentUser = userService.getCurrentUser();
        List<Post> posts = postService.getAllPosts();
        List<PostResponse> responses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        User currentUser = userService.getCurrentUser();
        List<Post> posts;
        
        List<User> followedUsers = currentUser.getSubscribedTo().stream().collect(Collectors.toList());
        followedUsers.add(currentUser); 
        
        if (followedUsers.isEmpty()) {
            posts = postService.getPostsByUser(currentUser);
        } else {
            posts = postService.getPostsFromSubscribedUsers(followedUsers);
        }
        
        List<PostResponse> responses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId) {
        User currentUser = userService.getCurrentUser();
        Optional<User> targetUser = userService.getUserById(userId);
        
        if (targetUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Post> posts = postService.getPostsByUser(targetUser.get());
        List<PostResponse> responses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        return postService.getPostById(id)
                .map(post -> ResponseEntity.ok(postService.convertToPostResponse(post, currentUser)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@RequestBody PostRequest postRequest) {
        User currentUser = userService.getCurrentUser();
        
        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setMediaUrl(postRequest.getMediaUrl());
        post.setMediaType(postRequest.getMediaType());
        post.setAuthor(currentUser);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        Post savedPost = postService.createPost(post);
        
        // Notify followers about the new post
        notificationService.createNewPostNotification(savedPost);
        
        PostResponse response = postService.convertToPostResponse(savedPost, currentUser);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    // Only the post owner can edit
    @PreAuthorize("@postSecurity.isPostOwner(#id)")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @RequestBody PostRequest postRequest) {
        User currentUser = userService.getCurrentUser();
        
        return postService.getPostById(id)
                .map(post -> {
                    post.setContent(postRequest.getContent());
                    post.setMediaUrl(postRequest.getMediaUrl());
                    post.setMediaType(postRequest.getMediaType());
                    post.setUpdatedAt(LocalDateTime.now());
                    
                    Post updatedPost = postService.updatePost(post);
                    PostResponse response = postService.convertToPostResponse(updatedPost, currentUser);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    // Owner or Admin can delete
    @PreAuthorize("@postSecurity.isPostOwner(#id) or hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }
    
    // LIKE/UNLIKE ENDPOINTS REMOVED - Handled by LikeController
}
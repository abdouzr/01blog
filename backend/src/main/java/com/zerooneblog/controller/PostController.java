// backend/src/main/java/com/zerooneblog/controller/PostController.java
package com.zerooneblog.controller;

import com.zerooneblog.dto.PostRequest;
import com.zerooneblog.dto.PostResponse;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.service.PostService;
import com.zerooneblog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired
    private PostService postService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        User currentUser = userService.getCurrentUser();
        List<Post> posts = postService.getAllPosts();
        List<PostResponse> postResponses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        return ResponseEntity.ok(postResponses);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId) {
        User currentUser = userService.getCurrentUser();
        Optional<User> userOptional = userService.getUserById(userId);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Post> posts = postService.getPostsByUser(userOptional.get());
        List<PostResponse> postResponses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        return ResponseEntity.ok(postResponses);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        User currentUser = userService.getCurrentUser();
        List<Post> posts = postService.getPostsFromSubscribedUsers(currentUser);
        List<PostResponse> postResponses = posts.stream()
                .map(post -> postService.convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
        return ResponseEntity.ok(postResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Optional<Post> postOptional = postService.getPostById(id);
        
        if (postOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        PostResponse postResponse = postService.convertToPostResponse(postOptional.get(), currentUser);
        return ResponseEntity.ok(postResponse);
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@RequestBody PostRequest postRequest) {
        User currentUser = userService.getCurrentUser();
        
        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setMediaUrl(postRequest.getMediaUrl());
        post.setMediaType(postRequest.getMediaType());
        post.setAuthor(currentUser);
        
        Post savedPost = postService.createPost(post);
        PostResponse postResponse = postService.convertToPostResponse(savedPost, currentUser);
        return ResponseEntity.ok(postResponse);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@postSecurity.isPostOwner(#id)")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @RequestBody PostRequest postRequest) {
        User currentUser = userService.getCurrentUser();
        Optional<Post> postOptional = postService.getPostById(id);
        
        if (postOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Post post = postOptional.get();
        post.setContent(postRequest.getContent());
        post.setMediaUrl(postRequest.getMediaUrl());
        post.setMediaType(postRequest.getMediaType());
        
        Post updatedPost = postService.updatePost(post);
        PostResponse postResponse = postService.convertToPostResponse(updatedPost, currentUser);
        return ResponseEntity.ok(postResponse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@postSecurity.isPostOwner(#id) or hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }
}
// backend/src/main/java/com/zerooneblog/controller/CommentController.java
package com.zerooneblog.controller;

import java.time.LocalDateTime;
import java.util.List;
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

import com.zerooneblog.dto.CommentRequest;
import com.zerooneblog.dto.CommentResponse;
import com.zerooneblog.model.Comment;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.security.CommentSecurity;
import com.zerooneblog.service.CommentService;
import com.zerooneblog.service.PostService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private CommentSecurity commentSecurity;

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(@PathVariable Long postId) {
        return postService.getPostById(postId)
            .map(post -> {
                List<Comment> comments = commentService.getCommentsByPost(post);
                List<CommentResponse> responses = comments.stream()
                    .map(this::convertToCommentResponse)
                    .collect(Collectors.toList());
                return ResponseEntity.ok(responses);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest commentRequest) {
        
        User currentUser = userService.getCurrentUser();
        
        return postService.getPostById(postId)
            .map(post -> {
                Comment comment = new Comment();
                comment.setContent(commentRequest.getContent());
                comment.setPost(post);
                comment.setAuthor(currentUser);
                comment.setCreatedAt(LocalDateTime.now());
                
                Comment savedComment = commentService.createComment(comment);
                CommentResponse response = convertToCommentResponse(savedComment);
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@commentSecurity.isCommentOwner(#id)")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @RequestBody CommentRequest commentRequest) {
        
        return commentService.getCommentById(id)
            .map(comment -> {
                comment.setContent(commentRequest.getContent());
                Comment updatedComment = commentService.updateComment(comment);
                CommentResponse response = convertToCommentResponse(updatedComment);
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@commentSecurity.isCommentOwner(#id) or hasRole('ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setAuthorId(comment.getAuthor().getId());
        response.setAuthorUsername(comment.getAuthor().getUsername());
        response.setAuthorProfilePicture(comment.getAuthor().getProfilePicture());
        response.setPostId(comment.getPost().getId());
        return response;
    }
}
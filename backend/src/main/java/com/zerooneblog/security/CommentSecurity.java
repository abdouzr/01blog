// backend/src/main/java/com/zerooneblog/security/CommentSecurity.java
package com.zerooneblog.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.zerooneblog.model.Comment;
import com.zerooneblog.service.CommentService;
import com.zerooneblog.service.UserService;

@Component
public class CommentSecurity {
    @Autowired
    private CommentService commentService;
    
    @Autowired
    private UserService userService;

    public boolean isCommentOwner(Long commentId) {
        try {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            Comment comment = commentService.getCommentById(commentId).orElse(null);
            
            if (comment == null) return false;
            
            return comment.getAuthor().getUsername().equals(currentUsername);
        } catch (Exception e) {
            return false;
        }
    }
}
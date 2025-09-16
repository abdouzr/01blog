// backend/src/main/java/com/zerooneblog/security/PostSecurity.java
package com.zerooneblog.security;

import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.PostRepository;
import com.zerooneblog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("postSecurity")
public class PostSecurity {
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserService userService;

    public boolean isPostOwner(Long postId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Post> postOptional = postRepository.findById(postId);
        
        if (postOptional.isEmpty()) {
            return false;
        }
        
        Post post = postOptional.get();
        return post.getAuthor().getUsername().equals(username);
    }
}
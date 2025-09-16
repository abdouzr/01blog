// backend/src/main/java/com/zerooneblog/service/PostService.java
package com.zerooneblog.service;

import com.zerooneblog.dto.PostResponse;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.LikeRepository;
import com.zerooneblog.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private UserService userService;

    public List<Post> getAllPosts() {
        return postRepository.findAllOrderByCreatedAtDesc();
    }

    public List<Post> getPostsByUser(User user) {
        return postRepository.findByAuthorOrderByCreatedAtDesc(user);
    }

    public List<Post> getPostsFromSubscribedUsers(User user) {
        List<User> subscribedUsers = user.getSubscribedTo().stream().collect(Collectors.toList());
        return postRepository.findByAuthorsOrderByCreatedAtDesc(subscribedUsers);
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public Post updatePost(Post post) {
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    public PostResponse convertToPostResponse(Post post, User currentUser) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setMediaUrl(post.getMediaUrl());
        response.setMediaType(post.getMediaType());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorUsername(post.getAuthor().getUsername());
        response.setAuthorProfilePicture(post.getAuthor().getProfilePicture());
        response.setLikeCount(likeRepository.countByPost(post));
        response.setCommentCount((long) post.getComments().size());
        response.setLikedByCurrentUser(likeRepository.findByUserAndPost(currentUser, post).isPresent());
        
        return response;
    }
}
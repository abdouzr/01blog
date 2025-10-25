package com.zerooneblog.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zerooneblog.dto.PostResponse;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.LikeRepository;
import com.zerooneblog.repository.PostRepository;

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

    // Updated method to accept List<User> instead of single User
    public List<Post> getPostsFromSubscribedUsers(List<User> users) {
        return postRepository.findByAuthorsOrderByCreatedAtDesc(users);
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
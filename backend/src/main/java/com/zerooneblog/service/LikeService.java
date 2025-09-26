// backend/src/main/java/com/zerooneblog/service/LikeService.java
package com.zerooneblog.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zerooneblog.dto.LikeResponse;
import com.zerooneblog.model.Like;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.LikeRepository;
import com.zerooneblog.repository.PostRepository;
import com.zerooneblog.repository.UserRepository;

@Service
public class LikeService {
    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public void likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already liked
        if (likeRepository.existsByUserAndPost(user, post)) {
            throw new RuntimeException("Post already liked");
        }

        Like like = new Like(user, post);
        likeRepository.save(like);
    }

    public void unlikePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Like like = likeRepository.findByUserAndPost(user, post)
            .orElseThrow(() -> new RuntimeException("Like not found"));

        likeRepository.delete(like);
    }

    public List<LikeResponse> getLikesByPost(Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        return likeRepository.findByPost(post).stream()
            .map(this::convertToLikeResponse)
            .collect(Collectors.toList());
    }

    public List<LikeResponse> getLikesByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return likeRepository.findByUser(user).stream()
            .map(this::convertToLikeResponse)
            .collect(Collectors.toList());
    }

    public Long getLikeCountByPost(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    public boolean isPostLikedByUser(Long postId, Long userId) {
        return likeRepository.findByPostIdAndUserId(postId, userId).isPresent();
    }

    private LikeResponse convertToLikeResponse(Like like) {
        LikeResponse response = new LikeResponse();
        response.setId(like.getId());
        response.setUserId(like.getUser().getId());
        response.setUsername(like.getUser().getUsername());
        response.setProfilePicture(like.getUser().getProfilePicture());
        response.setPostId(like.getPost().getId());
        response.setCreatedAt(like.getCreatedAt());
        return response;
    }
}
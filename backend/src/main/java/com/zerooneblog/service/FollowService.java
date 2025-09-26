// backend/src/main/java/com/zerooneblog/service/FollowService.java
package com.zerooneblog.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zerooneblog.dto.FollowResponse;
import com.zerooneblog.model.Follow;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.FollowRepository;
import com.zerooneblog.repository.UserRepository;

@Service
public class FollowService {
    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    public void followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("Cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new RuntimeException("Follower user not found"));
        User following = userRepository.findById(followingId)
            .orElseThrow(() -> new RuntimeException("Following user not found"));

        // Check if already following
        if (followRepository.existsByFollowerAndFollowing(follower, following)) {
            throw new RuntimeException("Already following this user");
        }

        Follow follow = new Follow(follower, following);
        followRepository.save(follow);
    }

    public void unfollowUser(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new RuntimeException("Follower user not found"));
        User following = userRepository.findById(followingId)
            .orElseThrow(() -> new RuntimeException("Following user not found"));

        Follow follow = followRepository.findByFollowerAndFollowing(follower, following)
            .orElseThrow(() -> new RuntimeException("Follow relationship not found"));

        followRepository.delete(follow);
    }

    public List<FollowResponse> getFollowers(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return followRepository.findByFollowing(user).stream()
            .map(this::convertToFollowResponse)
            .collect(Collectors.toList());
    }

    public List<FollowResponse> getFollowing(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return followRepository.findByFollower(user).stream()
            .map(this::convertToFollowResponse)
            .collect(Collectors.toList());
    }

    public Long getFollowerCount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.countByFollowing(user);
    }

    public Long getFollowingCount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.countByFollower(user);
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent();
    }

    private FollowResponse convertToFollowResponse(Follow follow) {
        FollowResponse response = new FollowResponse();
        response.setId(follow.getId());
        response.setCreatedAt(follow.getCreatedAt());

        // Set follower info
        FollowResponse.UserResponse follower = new FollowResponse.UserResponse();
        follower.setId(follow.getFollower().getId());
        follower.setUsername(follow.getFollower().getUsername());
        follower.setProfilePicture(follow.getFollower().getProfilePicture());
        response.setFollower(follower);

        // Set following info
        FollowResponse.UserResponse following = new FollowResponse.UserResponse();
        following.setId(follow.getFollowing().getId());
        following.setUsername(follow.getFollowing().getUsername());
        following.setProfilePicture(follow.getFollowing().getProfilePicture());
        response.setFollowing(following);

        return response;
    }
}
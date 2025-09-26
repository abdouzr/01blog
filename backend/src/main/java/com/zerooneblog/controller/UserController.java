// backend/src/main/java/com/zerooneblog/controller/UserController.java
package com.zerooneblog.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.UserResponse;
import com.zerooneblog.model.User;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsers(query);
        User currentUser = userService.getCurrentUser();
        
        List<UserResponse> responses = users.stream()
            .map(user -> convertToUserResponse(user, currentUser))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        
        return userService.getUserById(id)
            .map(user -> ResponseEntity.ok(convertToUserResponse(user, currentUser)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<?> followUser(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        
        return userService.getUserById(id)
            .map(userToFollow -> {
                if (userToFollow.getId().equals(currentUser.getId())) {
                    return ResponseEntity.badRequest().body("Cannot follow yourself");
                }
                
                userService.followUser(currentUser, userToFollow);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<?> unfollowUser(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        
        return userService.getUserById(id)
            .map(userToUnfollow -> {
                userService.unfollowUser(currentUser, userToUnfollow);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<UserResponse>> getFollowers(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        
        return userService.getUserById(id)
            .map(user -> {
                List<User> followers = userService.getFollowers(user);
                List<UserResponse> responses = followers.stream()
                    .map(follower -> convertToUserResponse(follower, currentUser))
                    .collect(Collectors.toList());
                return ResponseEntity.ok(responses);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<UserResponse>> getFollowing(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        
        return userService.getUserById(id)
            .map(user -> {
                List<User> following = userService.getFollowing(user);
                List<UserResponse> responses = following.stream()
                    .map(followedUser -> convertToUserResponse(followedUser, currentUser))
                    .collect(Collectors.toList());
                return ResponseEntity.ok(responses);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private UserResponse convertToUserResponse(User user, User currentUser) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setBio(user.getBio());
        response.setProfilePicture(user.getProfilePicture());
        response.setCreatedAt(user.getCreatedAt());
        response.setFollowerCount((long) user.getSubscribers().size());
        response.setFollowingCount((long) user.getSubscribedTo().size());
        response.setIsFollowedByCurrentUser(
            currentUser.getSubscribedTo().contains(user)
        );
        return response;
    }
}
package com.zerooneblog.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.User;
import com.zerooneblog.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> searchUsers(String query) {
        return userRepository.searchUsers(query);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // User follow/unfollow logic
    @Transactional
    public void followUser(User follower, User userToFollow) {
        follower.getSubscribedTo().add(userToFollow);
        userRepository.save(follower);
    }

    @Transactional
    public void unfollowUser(User follower, User userToUnfollow) {
        follower.getSubscribedTo().remove(userToUnfollow);
        userRepository.save(follower);
    }

    public List<User> getFollowers(User user) {
        return user.getSubscribers().stream().collect(Collectors.toList());
    }

    public List<User> getFollowing(User user) {
        return user.getSubscribedTo().stream().collect(Collectors.toList());
    }

    public boolean isFollowing(User follower, User target) {
        return follower.getSubscribedTo().contains(target);
    }

    // --- Admin Action Methods ---

    @Transactional
    public void deleteUser(Long userId) {
        System.out.println("Attempting to delete user with ID: " + userId);
        
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        
        userRepository.deleteById(userId);
        System.out.println("User deleted successfully");
    }

    @Transactional
    public void banUser(Long userId) {
        System.out.println("Attempting to ban user with ID: " + userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        
        user.setIsBlocked(true);
        userRepository.save(user);
        System.out.println("User banned successfully");
    }
    
    @Transactional
    public void unbanUser(Long userId) {
        System.out.println("Attempting to unban user with ID: " + userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
            
        user.setIsBlocked(false);
        userRepository.save(user);
        System.out.println("User unbanned successfully");
    }
    
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
}
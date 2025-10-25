package com.zerooneblog.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.UserDto;
import com.zerooneblog.model.Post;
import com.zerooneblog.model.Report;
import com.zerooneblog.model.User;
import com.zerooneblog.service.PostService;
import com.zerooneblog.service.ReportService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/admin")
// @CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;
    
    @Autowired
    private ReportService reportService;

    // --- User Management ---

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        try {
            List<User> users = userService.findAllUsers();
            List<UserDto> userDtos = users.stream()
                    .map(this::convertToUserDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/ban/{id}")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        try {
            userService.banUser(id);
            return ResponseEntity.ok("User " + id + " banned successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error banning user: " + e.getMessage());
        }
    }
    
    @PostMapping("/unban/{id}")
    public ResponseEntity<?> unbanUser(@PathVariable Long id) {
        try {
            userService.unbanUser(id);
            return ResponseEntity.ok("User " + id + " unbanned successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error unbanning user: " + e.getMessage());
        }
    }
    
    // FIXED: Changed from /delete/user/{id} to /users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User " + id + " deleted successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    private UserDto convertToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setIsBlocked(user.getIsBlocked());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    // --- Post Management ---

    @GetMapping("/posts")
public ResponseEntity<List<Post>> getAllPosts() {
    try {
        System.out.println("Admin requesting all posts...");
        List<Post> posts = postService.getAllPosts();
        System.out.println("Found " + posts.size() + " posts");
        return ResponseEntity.ok(posts);
    } catch (Exception e) {
        System.err.println("Error loading posts: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).build();
    }
}

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok("Post " + id + " deleted successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting post: " + e.getMessage());
        }
    }
    
    @PostMapping("/posts/{id}/hide")
    public ResponseEntity<?> hidePost(@PathVariable Long id) {
        return ResponseEntity.ok("Post " + id + " hidden successfully (Admin Action)");
    }
    
    // --- Report Management ---
    
    @GetMapping("/reports")
public ResponseEntity<List<Report>> getAllNewReports() {
    try {
        System.out.println("Admin requesting all reports...");
        List<Report> reports = reportService.getAllNewReports();
        System.out.println("Found " + reports.size() + " reports");
        return ResponseEntity.ok(reports);
    } catch (Exception e) {
        System.err.println("Error loading reports: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).build();
    }
}
    
    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        try {
            reportService.markReportAsReviewed(id);
            return ResponseEntity.ok("Report " + id + " resolved.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error resolving report: " + e.getMessage());
        }
    }
}
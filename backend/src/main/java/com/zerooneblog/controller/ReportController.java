package com.zerooneblog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.ReportRequest;
import com.zerooneblog.model.Report;
import com.zerooneblog.model.Report.TargetType;
import com.zerooneblog.model.User;
import com.zerooneblog.service.ReportService;
import com.zerooneblog.service.UserService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> submitReport(@RequestBody ReportRequest request) {
        try {
            System.out.println("Received report request: " + request.getTargetType() + " - " + request.getTargetId());
            
            User currentUser = userService.getCurrentUser();
            System.out.println("Current user: " + currentUser.getUsername());
            
            // Validate target type
            if (request.getTargetType() == null || request.getTargetType().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Target type is required");
            }
            
            // Convert string to enum
            TargetType targetType;
            try {
                targetType = TargetType.valueOf(request.getTargetType().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid target type: " + request.getTargetType());
            }
            
            // Create report
            Report report = reportService.createReport(
                currentUser, 
                targetType, 
                request.getTargetId(), 
                request.getReason()
            );
            
            System.out.println("Report created successfully with ID: " + report.getId());
            
            return ResponseEntity.ok("Report submitted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error submitting report: " + e.getMessage());
        }
    }
}
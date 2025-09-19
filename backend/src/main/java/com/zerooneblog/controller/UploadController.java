package com.zerooneblog.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zerooneblog.service.CloudinaryService;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            if (file.getSize() > 50 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 50MB");
            }

            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
                return ResponseEntity.badRequest().body("Only image and video files are allowed");
            }

            Map uploadResult = cloudinaryService.uploadFile(file);
            
            String fileUrl = (String) uploadResult.get("secure_url");
            String resourceType = (String) uploadResult.get("resource_type");
            String mediaType = "image".equals(resourceType) ? "image" : "video";

            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("mediaType", mediaType);
            response.put("publicId", (String) uploadResult.get("public_id"));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<?> deleteFile(@PathVariable String publicId) {
        try {
            // For security, you might want to add some validation here
            // For example, check if the current user owns this file
            Map result = cloudinaryService.deleteFile(publicId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to delete file: " + e.getMessage());
        }
    }
}
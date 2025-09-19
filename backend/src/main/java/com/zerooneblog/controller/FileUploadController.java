package com.zerooneblog.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zerooneblog.service.CloudinaryService;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            Map uploadResult = cloudinaryService.uploadFile(file);
            
            String fileUrl = (String) uploadResult.get("secure_url");
            String resourceType = (String) uploadResult.get("resource_type");
            String publicId = (String) uploadResult.get("public_id");
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("mediaType", resourceType);
            response.put("publicId", publicId);
            response.put("message", "File uploaded successfully to Cloudinary");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteFile(@PathVariable String publicId) {
        try {
            Map result = cloudinaryService.deleteFile(publicId);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body("Failed to delete file from Cloudinary: " + e.getMessage());
        }
    }
}
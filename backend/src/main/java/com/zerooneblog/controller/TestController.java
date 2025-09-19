package com.zerooneblog.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.security.JwtUtils;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            response.put("token", token);
            response.put("valid", jwtUtils.validateJwtToken(token));
            
            if (jwtUtils.validateJwtToken(token)) {
                response.put("username", jwtUtils.getUserNameFromJwtToken(token));
            }
        } else {
            response.put("error", "No valid Authorization header");
        }
        
        return ResponseEntity.ok(response);
    }
}
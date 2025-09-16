// backend/src/main/java/com/zerooneblog/controller/AuthController.java
package com.zerooneblog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zerooneblog.dto.JwtResponse;
import com.zerooneblog.dto.LoginRequest;
import com.zerooneblog.dto.SignupRequest;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.UserRepository;
import com.zerooneblog.security.JwtUtils;
import com.zerooneblog.security.UserPrincipal;
import com.zerooneblog.service.UserService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserService userService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();        
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        
        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 userDetails.getEmail(), 
                                                 role));
    }

   @PostMapping("/signup")
public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userService.existsByUsername(signUpRequest.getUsername())) {
        return ResponseEntity.badRequest().body("Error: Username is already taken!");
    }

    if (userService.existsByEmail(signUpRequest.getEmail())) {
        return ResponseEntity.badRequest().body("Error: Email is already in use!");
    }

    // Create new user's account
    User user = new User(signUpRequest.getUsername(), 
                         signUpRequest.getEmail(),
                         encoder.encode(signUpRequest.getPassword()));

    userService.saveUser(user);

    // Generate JWT token for the new user
    String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
    
    // Convert Role enum to String for JwtResponse
    String roleString = user.getRole().name(); // Use .name() to get enum value as String
    
    // Return JWT token like the signin endpoint
    return ResponseEntity.ok(new JwtResponse(jwt, 
                                             user.getId(), 
                                             user.getUsername(), 
                                             user.getEmail(), 
                                             roleString)); // Use the String version
}

}
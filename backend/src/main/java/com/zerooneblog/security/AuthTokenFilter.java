// backend/src/main/java/com/zerooneblog/security/AuthTokenFilter.java

package com.zerooneblog.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class AuthTokenFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String jwt = parseJwt(request);
            
            // Enhanced logging
            String requestURI = request.getRequestURI();
            logger.debug("🔍 Processing request to: {}", requestURI);
            
            if (jwt != null) {
                logger.debug("✅ JWT Token found in request");
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    logger.debug("✅ Valid JWT for user: {}", username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    logger.debug("✅ Authentication set for user: {}", username);
                } else {
                    logger.warn("⚠️ Invalid JWT token for request to: {}", requestURI);
                }
            } else {
                logger.debug("ℹ️ No JWT token found in request to: {}", requestURI);
            }
        } catch (Exception e) {
            logger.error("❌ Cannot set user authentication: {}", e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts JWT token from the Authorization header
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        logger.debug("📋 Authorization Header: {}", 
            headerAuth != null ? (headerAuth.substring(0, Math.min(20, headerAuth.length())) + "...") : "null");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7); // Remove "Bearer " prefix
            logger.debug("🎫 Extracted token (first 20 chars): {}", 
                token.substring(0, Math.min(20, token.length())) + "...");
            return token;
        }

        return null;
    }
}
// backend/src/main/java/com/zerooneblog/security/UserDetailsServiceImpl.java

package com.zerooneblog.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.zerooneblog.model.User;
import com.zerooneblog.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // ✅ FIXED: Changed from getIsBlocked() to isBlocked()
        if (user.isBlocked()) {
            throw new RuntimeException("User account is blocked");
        }
        
        return UserPrincipal.build(user); // User implements UserDetails
    }
}
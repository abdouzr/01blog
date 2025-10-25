package com.zerooneblog.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.User;
import com.zerooneblog.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        // CHECK IF USER IS BANNED
        if (user.getIsBlocked() != null && user.getIsBlocked()) {
            throw new UsernameNotFoundException("User account is banned");
        }

        // RETURN UserPrincipal instead of org.springframework.security.core.userdetails.User
        return UserPrincipal.build(user);
    }
}
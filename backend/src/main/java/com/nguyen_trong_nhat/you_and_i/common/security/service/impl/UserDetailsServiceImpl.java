package com.nguyen_trong_nhat.you_and_i.common.security.service.impl;

import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository repo;

    @Override
    @NullMarked
    @Cacheable(value = "userDetails", key = "#username.toLowerCase()")
    public UserDetails loadUserByUsername(String username) {
        return repo.findByUsernameIgnoreCase(username.toLowerCase(Locale.ROOT))
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));
    }
}

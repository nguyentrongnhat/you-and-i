package com.nguyen_trong_nhat.you_and_i.features.user.controller;

import com.nguyen_trong_nhat.you_and_i.common.security.service.impl.UserDetailsServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequestMapping("api/user")
@AllArgsConstructor
public class UserController {
    private final UserDetailsServiceImpl userDetailsService;

    @GetMapping("")
    public String getCurrentUser() {
        String userName = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        var userDetail = userDetailsService.loadUserByUsername(userName);
        return "OK";
    }
}

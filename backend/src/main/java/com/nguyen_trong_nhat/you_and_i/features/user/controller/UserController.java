package com.nguyen_trong_nhat.you_and_i.features.user.controller;

import com.nguyen_trong_nhat.you_and_i.common.security.service.impl.UserDetailsServiceImpl;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("api/user")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/all")
    public List<MyUserDetail> getAllUsers() {
        String userName = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        return userService.getAllUser();
    }
}

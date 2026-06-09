package com.nguyen_trong_nhat.you_and_i.features.user.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.UnauthorizedException;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("api/user")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/all")
    public List<UserDetailDTO> getAllUsers() {
        return userService.getAllUser();
    }


    @PutMapping("/update")
    public UserDetailDTO updateUserData(@RequestBody @Valid UserDetailDTO userDetailDTO) {

        if (!Objects.equals(SecurityUtils.getLoggedInUsername(), userDetailDTO.getUsername())
                && !SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN)
                && !SecurityUtils.hasAuthorities(Constants.ROLE_ADMIN)
        ) {
            throw new RuntimeException("Unauthorized to update this user's data");
        }

        return userService.updateUserData(userDetailDTO);
    }


    @GetMapping("/{userId}")
    public UserDetailDTO getUserDetailById(@PathVariable String userId) {
        return userService.getUserDetailsById(userId);
    }
}

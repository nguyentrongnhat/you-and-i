package com.nguyen_trong_nhat.you_and_i.features.user.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.ForbidenException;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UpdateUserRequest;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("api/user")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/all")
    public Page<UserDetailDTO> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (!SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN)) {
            throw new ForbidenException("You have no permission to access this data");
        }
        return userService.getAllUser(page, size);
    }


    @PutMapping("/update")
    public UserDetailDTO updateUserData(@RequestBody @Valid UpdateUserRequest updateUserRequest) {

        if (!Objects.equals(SecurityUtils.getLoggedInUsername(), updateUserRequest.getUsername().trim().toLowerCase())
                && !SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN)
                && !SecurityUtils.hasAuthorities(Constants.ROLE_ADMIN)
        ) {
            throw new ForbidenException("You have no permission to update this user's data");
        }

        return userService.updateUserData(updateUserRequest);
    }


    @GetMapping("/{userId}")
    public UserDetailDTO getUserDetailById(@PathVariable String userId) {
        return userService.getUserDetailsById(userId);
    }
}

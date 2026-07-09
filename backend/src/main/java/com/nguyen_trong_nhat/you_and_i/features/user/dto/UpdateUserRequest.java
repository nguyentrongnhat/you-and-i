package com.nguyen_trong_nhat.you_and_i.features.user.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    @NotBlank(message = "Username is required")
    @Size(max = 255, message = "Username must be at most 255 characters")
    private String username;

    @Valid
    @NotNull(message = "Profile is required")
    private UserProfileDTO profile;

    /**
     * Admin-only fields. Ignored for self-update by non-admin users.
     */
    private Set<String> roles;
    private Boolean enabled;
    private Boolean emailVerified;
}


package com.nguyen_trong_nhat.you_and_i.features.user.dto;

import jakarta.persistence.Column;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailDTO {
    @NonNull
    private UUID id;
    @NonNull
    private String username;
    @NonNull
    private UserProfileDTO profile;
    @NonNull
    private Set<String> roles;
    private boolean enabled;
    private boolean emailVerified;
}

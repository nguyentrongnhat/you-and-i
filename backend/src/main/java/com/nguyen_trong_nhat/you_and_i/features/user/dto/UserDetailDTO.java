package com.nguyen_trong_nhat.you_and_i.features.user.dto;

import lombok.*;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailDTO {
    private UUID id;
    private String username;
    private UserProfileDTO profile;
    private Set<String> roles;
    private Boolean enabled;
    private Boolean emailVerified;
}

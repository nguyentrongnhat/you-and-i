package com.nguyen_trong_nhat.you_and_i.features.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {
    private String fullName;
    private String displayName;
    private String avatarUrl;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bio;
    private String address;
}

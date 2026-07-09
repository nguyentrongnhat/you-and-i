package com.nguyen_trong_nhat.you_and_i.features.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    @Size(max = 150, message = "Display name must be at most 150 characters")
    private String displayName;

    @Size(max = 2048, message = "Avatar URL must be at most 2048 characters")
    private String avatarUrl;

    @Pattern(regexp = "^$|^[+]?[0-9()\\-\\s]{7,20}$", message = "Phone number format is invalid")
    private String phone;

    private LocalDate dateOfBirth;

    @Size(max = 20, message = "Gender must be at most 20 characters")
    private String gender;

    @Size(max = 1000, message = "Bio must be at most 1000 characters")
    private String bio;

    @Size(max = 1000, message = "Address must be at most 1000 characters")
    private String address;
}

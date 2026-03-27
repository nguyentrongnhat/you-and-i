package com.nguyen_trong_nhat.you_and_i.common.dto;

import com.nguyen_trong_nhat.you_and_i.common.exception.ErrorConstant;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UsernamePasswordSignupRequest {
    @NotBlank(message = ErrorConstant.PASSWORD_REQUIRED)
    @Email(message = ErrorConstant.EMAIL_INVALID_FORMAT)
    private String username;

    @NotBlank(message = ErrorConstant.PASSWORD_REQUIRED)
    private String password;

    @NotBlank(message = ErrorConstant.CONFIRN_PASSWORD_REQUIRED)
    private String confirmPassword;
}
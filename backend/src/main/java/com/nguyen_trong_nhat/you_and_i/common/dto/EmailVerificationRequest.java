package com.nguyen_trong_nhat.you_and_i.common.dto;

import com.nguyen_trong_nhat.you_and_i.common.exception.ErrorConstant;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmailVerificationRequest {
    @NotBlank(message = ErrorConstant.PASSWORD_REQUIRED)
    private String email;

    @NotBlank(message = ErrorConstant.VERIFICATION_CODE_REQUIRED)
    private String verificationCode;
}

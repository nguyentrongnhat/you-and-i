package com.nguyen_trong_nhat.you_and_i.common.dto;

import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserDetailDTO userInfo;
}

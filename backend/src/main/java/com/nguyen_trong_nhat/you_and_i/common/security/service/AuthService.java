package com.nguyen_trong_nhat.you_and_i.common.security.service;

import com.nguyen_trong_nhat.you_and_i.common.dto.LoginResponse;
import com.nguyen_trong_nhat.you_and_i.common.dto.UsernamePasswordSignupRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthService {
    LoginResponse usernamePasswordAuthenticate(String username, String password);

    LoginResponse refreshTokenAuthenticate(String refreshToken);

    UserDetails authenticate(Authentication authentication);

    void signup (UsernamePasswordSignupRequest signupData);
}

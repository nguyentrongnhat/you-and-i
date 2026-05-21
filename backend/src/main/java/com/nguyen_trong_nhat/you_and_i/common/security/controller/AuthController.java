package com.nguyen_trong_nhat.you_and_i.common.security.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.dto.*;
import com.nguyen_trong_nhat.you_and_i.common.security.service.impl.AuthServiceImpl;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthServiceImpl authService;


    @PostMapping("/login")
    public ResponseEntity<@NonNull LoginResponse> Login(@RequestBody UsernamePasswordLoginRequest req) {

        LoginResponse loginResponse = authService.usernamePasswordAuthenticate(req.getUsername(), req.getPassword());

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", loginResponse.getRefreshToken())
                .httpOnly(true)
                .sameSite("Lax")
                .secure(false) // true if https
                .path("/api/auth/refresh")
                .maxAge(Duration.ofSeconds(Constants.REFRESH_TOKEN_MAX_AGE))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(loginResponse);
    }


    @PostMapping("/signup")
    public ResponseEntity<@NonNull LoginResponse> Signup(@RequestBody @Valid UsernamePasswordSignupRequest signupRequest) {
        authService.signup(signupRequest);
        return ResponseEntity.ok().body(null);
    }


    @PostMapping("/verification-code")
    public ResponseEntity<@NonNull LoginResponse> createAndSendNotificationCode(@RequestBody @Valid VerificationCodeRequest verificationCodeRequest) {
        authService.createAndSendVerificationCodeForAccount(verificationCodeRequest.getEmail());
        return ResponseEntity.ok().body(null);
    }


    @PostMapping("/verify-account")
    public ResponseEntity<@NonNull LoginResponse> verifyAccount(@RequestBody @Valid EmailVerificationRequest emailVerificationRequest) {
        authService.verifyAccount(emailVerificationRequest);
        return ResponseEntity.ok().body(null);
    }


    @PostMapping("/refresh")
    public ResponseEntity<@NonNull LoginResponse> refreshToken(@CookieValue(name = "refresh_token", required = false) String refreshToken) {

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        LoginResponse loginResponse = authService.refreshTokenAuthenticate(refreshToken);

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", loginResponse.getRefreshToken())
                .httpOnly(true)
                .sameSite("Lax")
                .secure(false) // true if https
                .path("/api/auth/refresh")
                .maxAge(Duration.ofSeconds(Constants.REFRESH_TOKEN_MAX_AGE))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(loginResponse);
    }
}


package com.nguyen_trong_nhat.you_and_i.common.security.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.dto.*;
import com.nguyen_trong_nhat.you_and_i.common.security.dto.GoogleUserInfo;
import com.nguyen_trong_nhat.you_and_i.common.security.service.GoogleOAuth2Service;
import com.nguyen_trong_nhat.you_and_i.common.security.service.impl.AuthServiceImpl;
import com.nguyen_trong_nhat.you_and_i.features.mail.dto.GoogleTokenResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Duration;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final boolean secureCookie;
    private final String sameSiteCookie;
    private final AuthServiceImpl authService;
    private final GoogleOAuth2Service googleOAuth2Service;

    public AuthController(
            AuthServiceImpl authService,
            GoogleOAuth2Service googleOAuth2Service,
            @Value("${security.cookie.secure}") boolean secureCookie,
            @Value("${security.cookie.same-site}") String sameSiteCookie
    ) {
        this.authService = authService;
        this.googleOAuth2Service = googleOAuth2Service;
        this.secureCookie = secureCookie;
        this.sameSiteCookie = sameSiteCookie;
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid UsernamePasswordLoginRequest req) {

        LoginResponse loginResponse = authService.usernamePasswordAuthenticate(req.getUsername(), req.getPassword());

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", loginResponse.getRefreshToken())
                .httpOnly(true)
                .sameSite(sameSiteCookie)
                .secure(secureCookie) // true if https
                .path("/api/auth/refresh")
                .maxAge(Duration.ofSeconds(Constants.REFRESH_TOKEN_MAX_AGE))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(loginResponse);
    }


    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody @Valid UsernamePasswordSignupRequest signupRequest) {
        authService.signup(signupRequest);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/verification-code")
    public ResponseEntity<Void> createAndSendNotificationCode(@RequestBody @Valid VerificationCodeRequest verificationCodeRequest) {
        authService.createAndSendVerificationCodeForAccount(verificationCodeRequest.getEmail());
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/verify-account")
    public ResponseEntity<Void> verifyAccount(@RequestBody @Valid EmailVerificationRequest emailVerificationRequest) {
        authService.verifyAccount(emailVerificationRequest);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@CookieValue(name = "refresh_token", required = false) String refreshToken) {

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        LoginResponse loginResponse = authService.refreshTokenAuthenticate(refreshToken);

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", loginResponse.getRefreshToken())
                .httpOnly(true)
                .sameSite(sameSiteCookie)
                .secure(secureCookie) // true if https
                .path("/api/auth/refresh")
                .maxAge(Duration.ofSeconds(Constants.REFRESH_TOKEN_MAX_AGE))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(loginResponse);
    }


    @PostMapping("/refresh-mobile")
    public ResponseEntity<LoginResponse> refreshTokenForMobile(@RequestBody RefreshTokenRequest refreshTokenRequest) {

        if (refreshTokenRequest.getRefreshToken() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        LoginResponse loginResponse = authService.refreshTokenAuthenticate(refreshTokenRequest.getRefreshToken());

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", loginResponse.getRefreshToken())
                .httpOnly(true)
                .sameSite(sameSiteCookie)
                .secure(secureCookie) // true if https
                .path("/api/auth/refresh")
                .maxAge(Duration.ofSeconds(Constants.REFRESH_TOKEN_MAX_AGE))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(loginResponse);
    }


    @PostMapping("/signout")
    public ResponseEntity<Void> signout(@CookieValue(name = "refresh_token", required = false) String refreshToken) {
        // Optional: invalidate server-side refresh token if your authService provides such functionality
        // if (refreshToken != null) { authService.invalidateRefreshToken(refreshToken); }

        // Overwrite the refresh_token cookie with maxAge=0 to remove it from the client
        ResponseCookie deleteCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .sameSite(sameSiteCookie)
                .secure(secureCookie) // true if https
                .path("/api/auth/refresh")
                .maxAge(0)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    @PostMapping("/google/login")
    public ResponseEntity<LoginResponse> googleLoginFromFrontend(
            @RequestBody String code
    ) {
        log.info("Received Google code from frontend: {}", code);

        GoogleTokenResponse tokenResponse = googleOAuth2Service.exchangeAuthorizationCode(code);
        GoogleUserInfo userProfile = googleOAuth2Service.getUserInfo(tokenResponse.getAccessToken());

        LoginResponse loginResponse = authService.googleAuthenticate(userProfile);

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", loginResponse.getRefreshToken())
                .httpOnly(true)
                .sameSite(sameSiteCookie)
                .secure(secureCookie)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofSeconds(Constants.REFRESH_TOKEN_MAX_AGE))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(loginResponse);
    }
}

package com.nguyen_trong_nhat.you_and_i.features.mail.service.impl;

import com.nguyen_trong_nhat.you_and_i.features.mail.dto.GoogleTokenResponse;
import com.nguyen_trong_nhat.you_and_i.features.mail.service.MailOauth2TokenService;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

@Service
public class GmailOAuth2TokenServiceImpl implements MailOauth2TokenService {

    @Value("${gmail.oauth2.client-id}")
    private String clientId;

    @Value("${gmail.oauth2.client-secret}")
    private String clientSecret;

    @Value("${gmail.oauth2.refresh-token}")
    private String refreshToken;

    private String cachedToken;

    private Instant expiredAt;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public synchronized String getAccessToken() {
        if (cachedToken != null && expiredAt != null && Instant.now().isBefore(expiredAt)) {
            return cachedToken;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<@NonNull String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("refresh_token", refreshToken);
        body.add("grant_type", "refresh_token");

        HttpEntity<?> request = new HttpEntity<>(body, headers);

        ResponseEntity<@NonNull GoogleTokenResponse> response =
                restTemplate.postForEntity(
                        "https://oauth2.googleapis.com/token",
                        request,
                        GoogleTokenResponse.class
                );

        GoogleTokenResponse token = response.getBody();
        if (token == null) {
            throw new IllegalStateException("Cannot retrieve access token from Google");
        }

        cachedToken = token.getAccessToken();
        expiredAt = Instant.now().plusSeconds(token.getExpiresIn() - 60); // buffer 1 phút

        return cachedToken;
    }
}

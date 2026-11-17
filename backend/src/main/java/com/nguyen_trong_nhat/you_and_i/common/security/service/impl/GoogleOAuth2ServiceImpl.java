package com.nguyen_trong_nhat.you_and_i.common.security.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.security.dto.GoogleUserInfo;
import com.nguyen_trong_nhat.you_and_i.common.security.service.GoogleOAuth2Service;
import com.nguyen_trong_nhat.you_and_i.features.mail.dto.GoogleTokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class GoogleOAuth2ServiceImpl implements GoogleOAuth2Service {

    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USER_INFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
    private static final String GOOGLE_REDIRECT_URI = "http://localhost:8080/api/auth/google/callback";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Override
    public GoogleTokenResponse exchangeAuthorizationCode(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", GOOGLE_REDIRECT_URI);
        body.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            GoogleTokenResponse response = restTemplate.postForObject(
                    GOOGLE_TOKEN_URL,
                    request,
                    GoogleTokenResponse.class
            );

            if (response == null) {
                throw new IllegalStateException("Failed to exchange Google authorization code for tokens");
            }

            if (response.getAccessToken() == null || response.getIdToken() == null) {
                throw new IllegalStateException("Google token response is missing access_token or id_token");
            }

            return response;
        } catch (RestClientException ex) {
            log.error("Failed to exchange Google authorization code", ex);
            throw ex;
        }
    }

    @Override
    public GoogleUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            GoogleUserInfo response = restTemplate.exchange(
                    GOOGLE_USER_INFO_URL,
                    HttpMethod.GET,
                    request,
                    GoogleUserInfo.class
            ).getBody();

            if (response == null) {
                throw new IllegalStateException("Failed to fetch Google user profile");
            }

            return response;
        } catch (RestClientException ex) {
            log.error("Failed to fetch Google user profile using access token", ex);
            throw ex;
        }
    }
}

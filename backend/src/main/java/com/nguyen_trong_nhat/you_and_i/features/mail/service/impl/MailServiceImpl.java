package com.nguyen_trong_nhat.you_and_i.features.mail.service.impl;

import com.nguyen_trong_nhat.you_and_i.features.mail.service.MailOauth2TokenService;
import com.nguyen_trong_nhat.you_and_i.features.mail.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@EnableAsync
@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final MailOauth2TokenService gmailOAuth2TokenService;
    private final RestTemplate restTemplate;

    @Async
    @Override
    public void sendHtmlMail(String to, String subject, String html) {

        String accessToken = gmailOAuth2TokenService.getAccessToken();
        String rawEmail = buildRawEmail(to, subject, html);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of("raw", rawEmail);

        HttpEntity<?> request = new HttpEntity<>(body, headers);

        restTemplate.postForEntity(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                request,
                Void.class
        );
    }

    private String buildRawEmail(String to, String subject, String html) {
        String mail =
                "To: " + to + "\r\n" +
                        "Subject: " + subject + "\r\n" +
                        "Content-Type: text/html; charset=UTF-8\r\n\r\n" +
                        html;

        return Base64.getUrlEncoder()
                .encodeToString(mail.getBytes(StandardCharsets.UTF_8));
    }
}
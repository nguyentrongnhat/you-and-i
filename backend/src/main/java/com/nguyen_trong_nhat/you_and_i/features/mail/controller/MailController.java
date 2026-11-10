package com.nguyen_trong_nhat.you_and_i.features.mail.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.security.service.AuthService;
import com.nguyen_trong_nhat.you_and_i.features.mail.service.MailService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/email")
@AllArgsConstructor
public class MailController {
    private final MailService mailService;
    private final AuthService authService;

    @GetMapping("/test")
    @PreAuthorize("hasAuthority('" + Constants.ROLE_SUPER_ADMIN + "')")
    public String test() throws Exception {
        authService.testSendVerificationEmail("nguyentrongnhat111999@gmail.com");
        return "OK";
    }
}

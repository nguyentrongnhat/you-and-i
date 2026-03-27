package com.nguyen_trong_nhat.you_and_i.features.mail.controller;

import com.nguyen_trong_nhat.you_and_i.features.mail.service.MailService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class MailController {
    private final MailService mailService;

    @GetMapping("/mail/test")
    public String test() throws Exception {
        mailService.sendHtmlMail(
                "lordabsolute99@gmail.com",
                "OAuth2 Mail Test",
                "<h1>Gửi bằng OAuth2 thành công</h1>"
        );
        return "OK";
    }
}

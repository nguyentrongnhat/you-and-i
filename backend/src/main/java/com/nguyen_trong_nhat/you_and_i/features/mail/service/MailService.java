package com.nguyen_trong_nhat.you_and_i.features.mail.service;

public interface MailService {
    void sendHtmlMail(String to, String subject, String html);
}

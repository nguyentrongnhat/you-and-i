package com.nguyen_trong_nhat.you_and_i.features.hello.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("api")
public class Hello {
    @Value("${api.env.test}")
    private String envTest;

    @GetMapping("")
    public String helloWorld(HttpServletRequest request) {
        log.info("Hello called");
        return "Hello world: " + envTest;
    }
}

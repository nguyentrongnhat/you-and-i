package com.nguyen_trong_nhat.you_and_i.features.hello.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api")
public class Hello {
    @GetMapping("")
    public String helloWorld() {
        return "Hello world";
    }
}

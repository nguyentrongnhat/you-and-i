package com.nguyen_trong_nhat.you_and_i.features.relationship.controller;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/relationship")
@AllArgsConstructor
public class RelationshipController {
    @GetMapping("")
    public String getAllRelationships() {
        return "Get all relationships";
    }

    @GetMapping("/user")
    public String getRelationshipByUser() {
        return "Get relationship by user";
    }
}

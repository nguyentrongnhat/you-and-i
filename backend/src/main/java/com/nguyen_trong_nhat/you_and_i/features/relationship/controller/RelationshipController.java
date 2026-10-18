package com.nguyen_trong_nhat.you_and_i.features.relationship.controller;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.mapper.RelationshipMapper;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipCacheService;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/relationship")
@AllArgsConstructor
public class RelationshipController {
    private final RelationshipService relationshipService;
    private final RelationshipMapper relationshipMapper;

    @GetMapping("")
    public List<RelationshipDTO> getAllRelationships() {
        return relationshipService.getAllRelationships().stream()
                .map(relationshipMapper::toRelationshipDTO)
                .toList();
    }

    @GetMapping("/user")
    public String getRelationshipByUser() {
        return "Get relationship by user";
    }

    @PostMapping("/create")
    public RelationshipDTO createRelationship(@RequestBody RelationshipDTO relationshipData) {
        Relationship relationship = relationshipService.createRelationship(relationshipData);
        return relationshipMapper.toRelationshipDTO(relationship);
    }
}

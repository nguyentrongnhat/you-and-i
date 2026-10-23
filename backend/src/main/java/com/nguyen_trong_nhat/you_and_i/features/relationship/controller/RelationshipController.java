package com.nguyen_trong_nhat.you_and_i.features.relationship.controller;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.mapper.RelationshipMapper;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipCacheService;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/relationship")
@AllArgsConstructor
public class RelationshipController {
    private final RelationshipService relationshipService;
    private final RelationshipCacheService relationshipCacheService;
    private final RelationshipMapper relationshipMapper;

    @GetMapping("")
    public List<RelationshipDTO> getAllRelationships() {
        return relationshipService.getAllRelationships().stream()
                .map(relationshipMapper::toRelationshipDTO)
                .toList();
    }

    @GetMapping("/{relationshipId}")
    public RelationshipDTO getRelationshipById(@PathVariable UUID relationshipId) {
        Relationship relationship = relationshipService.getRelationshipById(relationshipId);

        return relationshipMapper.toRelationshipDTO(relationship);
    }

    @GetMapping("/user/{username}")
    public List<RelationshipDTO> getRelationshipByUser(@PathVariable String username) {
        return relationshipCacheService.getRelationshipsByUsername(username).stream()
                .map(relationshipMapper::toRelationshipDTO)
                .toList();
    }

    @PostMapping("/create")
    public RelationshipDTO createRelationship(@RequestBody RelationshipDTO relationshipData) {
        Relationship relationship = relationshipService.createRelationship(relationshipData);
        return relationshipMapper.toRelationshipDTO(relationship);
    }

    @PutMapping("/update/{relationshipId}")
    public RelationshipDTO updateRelationship(@PathVariable UUID relationshipId,
                                              @RequestBody RelationshipDTO relationshipData) {
        Relationship relationship = relationshipService.updateRelationship(relationshipId, relationshipData);
        return relationshipMapper.toRelationshipDTO(relationship);
    }

    @DeleteMapping("/delete/{relationshipId}")
    public ResponseEntity<Void> deleteRelationship(@PathVariable UUID relationshipId) {
        relationshipService.deleteRelationship(relationshipId);
        return ResponseEntity.noContent().build();
    }
}

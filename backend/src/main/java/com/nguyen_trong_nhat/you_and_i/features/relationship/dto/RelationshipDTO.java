package com.nguyen_trong_nhat.you_and_i.features.relationship.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

// RelationshipMemberDTO is in the same package – explicit import for clarity

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipDTO {
    private UUID id;
    private RelationshipType type;
    private RelationshipStatus status;
    private String description;
    private Instant startAt;
    private Instant createdAt;
    private Instant updatedAt;
    private List<RelationshipMemberDTO> members;
}



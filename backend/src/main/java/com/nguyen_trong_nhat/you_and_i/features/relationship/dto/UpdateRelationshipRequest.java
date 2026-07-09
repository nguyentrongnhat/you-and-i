package com.nguyen_trong_nhat.you_and_i.features.relationship.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UpdateRelationshipRequest {
    private RelationshipType type;
    private RelationshipStatus status;
    private String description;
    private Instant startAt;
}


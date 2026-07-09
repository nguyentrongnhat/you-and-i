package com.nguyen_trong_nhat.you_and_i.features.relationship.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CreateRelationshipRequest {

    @NotNull(message = "Relationship type is required")
    private RelationshipType type;

    private String description;

    private Instant startAt;
}


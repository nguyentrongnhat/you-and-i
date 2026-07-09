package com.nguyen_trong_nhat.you_and_i.features.relationship.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipMemberDTO {
    private UUID id;
    private UUID userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private RelationshipRole role;
    private Instant joinedAt;
    private boolean active;
}


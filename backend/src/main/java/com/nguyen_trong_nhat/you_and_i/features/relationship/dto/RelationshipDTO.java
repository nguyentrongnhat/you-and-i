package com.nguyen_trong_nhat.you_and_i.features.relationship.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipDTO {

    private UUID id;

    private boolean active;

    private RelationshipType type;

    private String name;

    private RelationshipStatus status;

    private LocalDateTime startAt;

    private Set<RelationshipMemberDTO> members = new HashSet<>();
}

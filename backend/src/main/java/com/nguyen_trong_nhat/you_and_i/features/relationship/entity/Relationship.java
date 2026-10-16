package com.nguyen_trong_nhat.you_and_i.features.relationship.entity;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipStatus;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "relationships")
public class Relationship {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RelationshipType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RelationshipStatus status;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @OneToMany(
            mappedBy = "relationship",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<RelationshipMember> members = new HashSet<>();
}

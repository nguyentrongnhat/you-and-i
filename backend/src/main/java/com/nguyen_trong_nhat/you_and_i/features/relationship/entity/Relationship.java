package com.nguyen_trong_nhat.you_and_i.features.relationship.entity;

import com.nguyen_trong_nhat.you_and_i.common.entity.BaseEntity;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipStatus;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Setter
@Table(
        name = "relationships",
        indexes = {
                @Index(name = "idx_relationships_type", columnList = "type"),
                @Index(name = "idx_relationships_status", columnList = "status")
        }
)
public class Relationship extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    /**
     * Use LAZY to avoid loading all members every time a Relationship is fetched.
     * Load explicitly when needed.
     */
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "relationship", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RelationshipMember> memberships = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private RelationshipType type;

    @Column(name = "start_at")
    private Instant startAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RelationshipStatus status;

    @Column(name = "description", length = 500)
    private String description;
}

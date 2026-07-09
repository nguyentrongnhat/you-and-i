package com.nguyen_trong_nhat.you_and_i.features.relationship.entity;

import com.nguyen_trong_nhat.you_and_i.common.entity.BaseEntity;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipRole;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Setter
@Table(
        name = "relationship_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_relationship_member",
                        columnNames = {"relationship_id", "user_id"}
                )
        },
        indexes = {
                @Index(name = "idx_rel_members_relationship_id", columnList = "relationship_id"),
                @Index(name = "idx_rel_members_user_id", columnList = "user_id")
        }
)
public class RelationshipMember extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    /**
     * LAZY: the relationship object is rarely needed when querying members from a user context.
     * Load explicitly when required.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_id", nullable = false)
    private Relationship relationship;

    @Column(name = "relationship_id", insertable = false, updatable = false)
    private UUID relationshipId;

    /**
     * EAGER: user info is almost always needed when working with a membership record.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private MyUserDetail user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private RelationshipRole role;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}

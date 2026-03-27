package com.nguyen_trong_nhat.you_and_i.features.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nguyen_trong_nhat.you_and_i.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_verifications")
public class UserVerification extends BaseEntity {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private MyUserDetail user;

    @Column(name = "verification_code", nullable = false, length = 10)
    private String verificationCode;

    @Column(nullable = false)
    private LocalDateTime expiry;

    @Column(name = "used")
    private boolean used = false;
}
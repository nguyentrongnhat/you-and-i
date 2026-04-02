package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity;

import com.nguyen_trong_nhat.you_and_i.common.entity.BaseEntity;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "find_number_games")
public class FindNumberGame extends BaseEntity {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private MyUserDetail player;

    private Instant startTime;

    private Instant endTime;

    private String timeToFinish;

    private int bonusTime;
}

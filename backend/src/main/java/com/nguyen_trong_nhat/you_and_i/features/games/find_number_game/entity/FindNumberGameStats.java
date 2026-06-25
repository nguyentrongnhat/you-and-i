package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity;

import com.nguyen_trong_nhat.you_and_i.common.entity.BaseEntity;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "find_number_game_stats")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FindNumberGameStats extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private MyUserDetail player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "best_record_game_id", nullable = false)
    private FindNumberGame bestRecordGame;

    @Column(name="best_completion_time", nullable = false)
    private Integer bestCompletionTime;

    @Column(name = "total_games_played")
    private Integer totalGamesPlayed;
}

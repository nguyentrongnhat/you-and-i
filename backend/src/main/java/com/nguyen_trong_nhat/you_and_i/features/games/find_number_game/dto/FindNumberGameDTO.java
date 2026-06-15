package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto;

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
@Getter
@Setter
public class FindNumberGameDTO {
    private UUID id;

    private String player;

    private Integer totalNumbersToFind;

    private DifficultyLevel difficultyLevel;

    private Instant startTime;

    private Instant endTime;

    private String completionTime;

    private GameStatus gameStatus;

    private Integer lastSelectedNumber;

    private String  elapsedTime;

    private Integer bonusTime;

    private Instant updateAt;
}

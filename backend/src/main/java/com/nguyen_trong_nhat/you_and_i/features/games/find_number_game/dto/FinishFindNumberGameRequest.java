package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FinishFindNumberGameRequest {
    UUID gameId;
    String timeToFinish;
    Instant endTime;
}

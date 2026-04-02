package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class FindNumberGameHistoryResponse {
    Instant startTime;
    Instant endTime;
    String timeToFinish;
    int bonusTime;
}

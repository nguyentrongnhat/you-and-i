package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class FindNumberGameBestRecordDTO {
    private UUID gameId;
    private String playerFullName;
    private String playerDisplayName;
    private String playerUsername;
    private Instant archivedTime;
    private Integer completionTime;
}

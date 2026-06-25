package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class FindNumberGameHistory {
    List<FindNumberGameHistoryItem> history;
    FindNumberGameBestRecordDTO bestRecord;
    List<FindNumberGameDTO> unfinishedGames;
    Integer totalGamesPlayed;
}

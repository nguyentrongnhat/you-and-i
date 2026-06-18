package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.CreateNewFindNumberGameResponse;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameBestRecordDTO;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameDTO;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameUserBestRecord;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class FindNumberGameDataMapper {
    public static FindNumberGameDTO toDTO(FindNumberGame entity) {
        if (entity == null) {
            return null;
        }

        FindNumberGameDTO dto = new FindNumberGameDTO();

        dto.setId(entity.getId());

        dto.setPlayer(
                entity.getPlayer() != null
                        ? entity.getPlayer().getUsername()
                        : null
        );

        dto.setTotalNumbersToFind(entity.getTotalNumbersToFind());
        dto.setDifficultyLevel(entity.getDifficultyLevel());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setElapsedTime(entity.getElapsedTime());
        dto.setCompletionTime(entity.getCompletionTime());
        dto.setGameStatus(entity.getGameStatus());
        dto.setLastSelectedNumber(entity.getLastSelectedNumber());
        dto.setBonusTime(entity.getBonusTime());
        dto.setUpdateAt(entity.getUpdatedAt());

        return dto;
    }

    public static FindNumberGame toEntity(FindNumberGameDTO dto) {
        if (dto == null) {
            return null;
        }

        FindNumberGame entity = new FindNumberGame();

        if(dto.getTotalNumbersToFind() != 0) {
            entity.setTotalNumbersToFind(dto.getTotalNumbersToFind());
        }
        else {
            entity.setTotalNumbersToFind(100);
        }

        if(dto.getDifficultyLevel() != null) {
            entity.setDifficultyLevel(dto.getDifficultyLevel());
        }
        else {
            entity.setDifficultyLevel(DifficultyLevel.NORMAL);
        }
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setElapsedTime(dto.getElapsedTime());
        entity.setCompletionTime(dto.getCompletionTime());
        entity.setGameStatus(dto.getGameStatus());
        entity.setLastSelectedNumber(dto.getLastSelectedNumber());
        entity.setBonusTime(dto.getBonusTime());

        return entity;
    }

    public static void updateEntity(FindNumberGame entity, FindNumberGameDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setTotalNumbersToFind(dto.getTotalNumbersToFind());
        entity.setDifficultyLevel(dto.getDifficultyLevel());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setElapsedTime(dto.getElapsedTime());
        entity.setCompletionTime(dto.getCompletionTime());
        entity.setGameStatus(dto.getGameStatus());
        entity.setLastSelectedNumber(dto.getLastSelectedNumber());
        entity.setBonusTime(dto.getBonusTime());
    }

    public static FindNumberGameBestRecordDTO toBestRecordDTO(FindNumberGameUserBestRecord entity) {
        if (entity == null) {
            return null;
        }

        MyUserDetail user = entity.getPlayer();

        return new FindNumberGameBestRecordDTO(
                entity.getId(),
                user != null ? user.getProfile().getFullName() : null,
                entity.getPlayer() != null ? user.getProfile().getDisplayName() : null,
                entity.getPlayer() != null ? user.getUsername() : null,
                entity.getUpdatedAt(),
                entity.getBestCompletionTime()
        );
    }
}

package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameDTO;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameHistory;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameHistoryItem;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper.FindNumberGameDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class FindNumberGameCacheService {

    private final FindNumberGameRepository findNumberGameRepository;
    private final FindNumberGameBestRecordService findNumberGameBestRecordService;

    @Cacheable(value = Constants.CACHE_FIND_NUMBER_GAME_HISTORY, key = "#username")
    public FindNumberGameHistory getGameHistory(String username) {

        log.info("Cache MISS '{}' key='{}' -> get game history from DB",
                Constants.CACHE_FIND_NUMBER_GAME_HISTORY, username);

        List<FindNumberGameHistoryItem> gameFinished
                = findNumberGameRepository
                .findByPlayerUsernameAndEndTimeIsNotNull(username)
                .stream().map(game ->
                        new FindNumberGameHistoryItem(
                                game.getStartTime(),
                                game.getEndTime(),
                                game.getCompletionTime(),
                                game.getBonusTime()
                        )
                ).toList();

        List<FindNumberGameDTO> unfinishedGames = this.getUnfinishedGamesByPlayerUsername(username);

        FindNumberGameStats gameStats = findNumberGameBestRecordService.getGameStatsByPlayerUsername(username);

        return new FindNumberGameHistory(
                gameFinished,
                FindNumberGameDataMapper.toBestRecordDTO(gameStats),
                unfinishedGames,
                gameStats == null ? 0 : gameStats.getTotalGamesPlayed()
        );
    }


    @CacheEvict(value = Constants.CACHE_FIND_NUMBER_GAME_HISTORY, key = "#username")
    public void evictGameHistoryCache(String username) {
        log.info("Evicting cache '{}' key='{}' -> game history cache evicted",
                Constants.CACHE_FIND_NUMBER_GAME_HISTORY, username);
    }


    public List<FindNumberGameDTO> getUnfinishedGamesByPlayerUsername(String username) {
        return findNumberGameRepository.findByPlayerUsernameAndEndTimeIsNull(username).stream().map(FindNumberGameDataMapper::toDTO).toList();
    }
}

package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameDTO;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameHistory;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameHistoryItem;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper.FindNumberGameDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

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


    @Cacheable(value = Constants.CACHE_FIND_NUMBER_GAME, key = "#id.toString()")
    public FindNumberGame getGameById(String id) {
        UUID gameId;
        try {
            gameId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid game id format");
        }

        log.info("Cache MISS '{}' key='{}' -> get game from DB",
                Constants.CACHE_FIND_NUMBER_GAME, id);

        return findNumberGameRepository
                .findById(gameId)
                .orElseThrow(() -> new NotFoundException("Game not found with id: " + id));
    }

    @CacheEvict(value = Constants.CACHE_FIND_NUMBER_GAME, key = "#id.toString()")
    public void evictGameById(String id) {
        log.info("Evicting cache '{}' key='{}' -> single game cache evicted",
                Constants.CACHE_FIND_NUMBER_GAME, id);
    }

    @CacheEvict(value = Constants.CACHE_FIND_NUMBER_GAME, allEntries = true)
    public void evictAllGames() {
        log.info("Evicting cache '{}' -> all games cache evicted", Constants.CACHE_FIND_NUMBER_GAME);
    }
}

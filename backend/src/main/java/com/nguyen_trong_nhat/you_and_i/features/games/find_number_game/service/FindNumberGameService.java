package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.common.exception.ForbidenException;
import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.*;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper.FindNumberGameDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
@Slf4j
public class FindNumberGameService {
    private final FindNumberGameRepository findNumberGameRepository;
    private final FindNumberGameBestRecordService findNumberGameBestRecordService;
    private final UserRepository userRepository;

    @Transactional
    public FindNumberGame createNewGame(String username, CreateNewFindNumberGameRequest gameInfo) {
        MyUserDetail player = userRepository.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found"));
        int deletedColumn = this.deleteUnfinishedGamesByUsername(username);
        log.info("deleted {} unfinished games for user {}", deletedColumn, username);

        var newGame = new FindNumberGame();
        newGame.setBonusTime(0);
        newGame.setGameStatus(GameStatus.NEW);
        newGame.setDifficultyLevel(gameInfo.getDifficultyLevel());
        newGame.setPlayer(player);
        newGame = findNumberGameRepository.save(newGame);
        log.info("Created new game with id {} for user {}", newGame.getId(), username);

        return newGame;
    }


    public FindNumberGame getGameById(String id) {
        UUID gameId = UUID.fromString(id);
        return findNumberGameRepository
                .findById(gameId)
                .orElseThrow(() -> new NotFoundException("Game not found"));
    }


    public FindNumberGame updateGame(FindNumberGameDTO gameDTO) {
        if(gameDTO == null) {
            throw new BadRequestException("GameDTO is null");
        }

        if(gameDTO.getId() == null) {
            throw new BadRequestException("Can not identify the game to update.");
        }

        FindNumberGame gameEntity = findNumberGameRepository.findById(gameDTO.getId())
                .orElseThrow(() -> new NotFoundException("Game not Found!"));

        if(gameEntity.getGameStatus().equals(GameStatus.DONE)){
            throw new BadRequestException("Can not update the game already finished");
        }

        FindNumberGameDataMapper.updateEntity(gameEntity, gameDTO);

        findNumberGameRepository.save(gameEntity);

        return gameEntity;
    }


    @Transactional
    @CacheEvict(value = Constants.CACHE_FIND_NUMBER_GAME_HISTORY, key = "#userName")
    public FindNumberGame finishGame(String userName, FinishFindNumberGameRequest gameInfo) {

        FindNumberGame game = findNumberGameRepository.findById(gameInfo.getGameId())
                .orElseThrow(() -> new NotFoundException("Game not found: " + gameInfo.getGameId()));

        if (!game.getPlayer().getUsername().equals(userName)) {
            throw new ForbidenException("You are not player, so you can not finish the game!!!");
        }

        game.setCompletionTime(gameInfo.getCompletionTime());

        game.setElapsedTime(gameInfo.getCompletionTime());

        game.setEndTime(gameInfo.getEndTime());

        game.setGameStatus(GameStatus.DONE);

        FindNumberGame savedGame = findNumberGameRepository.save(game);

        log.info("Finished game {} for user {} | evict cache '{}' key='{}'",
                savedGame.getId(), userName, Constants.CACHE_FIND_NUMBER_GAME_HISTORY, userName);

        return savedGame;
    }


    @Cacheable(value = Constants.CACHE_FIND_NUMBER_GAME_HISTORY, key = "#username")
    public FindNumberGameHistory getGameHistory(String username) {

        log.debug("Cache MISS '{}' key='{}' -> get game history from DB",
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


    public List<FindNumberGameDTO> getUnfinishedGamesByPlayerUsername(String username) {
        return findNumberGameRepository.findByPlayerUsernameAndEndTimeIsNull(username).stream().map(FindNumberGameDataMapper::toDTO).toList();
    }

    @Transactional
    @Async
    @CacheEvict(value = Constants.CACHE_FIND_NUMBER_GAME_HISTORY, key = "#username")
    public void cleanupOldGames(String username, int keepCount, FindNumberGameStats gameStats) {

        UUID bestGameId = gameStats.getBestRecordGame().getId();

        List<UUID> recentIds = findNumberGameRepository.findRecentGame(
                username,
                PageRequest.of(0, keepCount)
        ).stream().map(FindNumberGame::getId).toList();

        Set<UUID> keepIds = new LinkedHashSet<>();
        keepIds.add(bestGameId);

        for (UUID id : recentIds) {
            if (keepIds.size() >= keepCount) {
                break;
            }
            keepIds.add(id);
        }

        findNumberGameRepository.deleteAllByPlayerIdAndIdNotIn(
                username,
                keepIds
        );
    }

    @Transactional
    public int deleteUnfinishedGamesByUsername(String username) {
        return findNumberGameRepository.deleteUnfinishedGamesByUsername(username);
    }
}

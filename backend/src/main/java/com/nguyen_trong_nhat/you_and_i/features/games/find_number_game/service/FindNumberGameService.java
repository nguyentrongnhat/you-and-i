package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.common.exception.UnauthorizedException;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.*;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper.FindNumberGameDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
public class FindNumberGameService {
    private final FindNumberGameRepository findNumberGameRepository;
    private final FindNumberGameBestRecordService findNumberGameBestRecordService;
    private final UserRepository userRepository;

    public FindNumberGame createNewGame(String username, CreateNewFindNumberGameRequest gameInfo) {

        Optional<MyUserDetail> playerOpt = userRepository.findByUsername(username);

        if(playerOpt.isEmpty()) throw new BadRequestException("");

        MyUserDetail player = playerOpt.get();

        var gamesAreNotFinish = findNumberGameRepository.findByPlayerUsernameAndEndTimeIsNull(username);

        findNumberGameRepository.deleteAll(gamesAreNotFinish);

        var newGame = new FindNumberGame();

        newGame.setBonusTime(0);

        newGame.setGameStatus(GameStatus.NEW);

        newGame.setDifficultyLevel(gameInfo.getDifficultyLevel());

        newGame.setPlayer(player);

        newGame = findNumberGameRepository.save(newGame);

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
            throw new BadRequestException("Game id is null");
        }

        FindNumberGame gameEntity = findNumberGameRepository.findById(gameDTO.getId())
                .orElseThrow(() -> new NotFoundException("Game not Found!"));

        if(gameEntity.getGameStatus().equals(GameStatus.DONE)){
            throw new BadRequestException("This game already finished. Can not update the game already finished");
        }

        FindNumberGameDataMapper.updateEntity(gameEntity, gameDTO);

        findNumberGameRepository.save(gameEntity);

        return gameEntity;
    }


    @Transactional
    public FindNumberGame finishGame(String userName, FinishFindNumberGameRequest gameInfo) {

        Optional<FindNumberGame> gameOpt = findNumberGameRepository.findById(gameInfo.getGameId());

        if(gameOpt.isEmpty()) throw new BadRequestException("");

        FindNumberGame game = gameOpt.get();

        if(!game.getPlayer().getUsername().equals(userName)) {
            throw new UnauthorizedException("You are not player, so you can not finish the game!!!");
        }

        game.setCompletionTime(gameInfo.getCompletionTime());

        game.setElapsedTime(gameInfo.getCompletionTime());

        game.setEndTime(gameInfo.getEndTime());

        game.setGameStatus(GameStatus.DONE);

        game = findNumberGameRepository.save(game);

        FindNumberGameStats gameStats = findNumberGameBestRecordService.updateGameStatsForUser(game.getPlayer(), game, true);

        int numberOfGameToKeep = 10;

        this.cleanupOldGames(userName, numberOfGameToKeep, gameStats);

        return game;
    }


    public FindNumberGameHistory getGameHistory(String username) {

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

        List<FindNumberGameDTO> unfinishedGames = this.getUnfinishedGamesForCurrentUser();

        FindNumberGameStats gameStats = findNumberGameBestRecordService.getGameStatsByPlayerUsername(username);


        return new FindNumberGameHistory(
                gameFinished,
                FindNumberGameDataMapper.toBestRecordDTO(gameStats),
                unfinishedGames,
                gameStats == null ? 0 : gameStats.getTotalGamesPlayed()
        );
    }


    public List<FindNumberGameDTO> getUnfinishedGamesForCurrentUser() {
        String username = SecurityUtils.getLoggedInUsername();
        return findNumberGameRepository.findByPlayerUsernameAndEndTimeIsNull(username).stream().map(FindNumberGameDataMapper::toDTO).toList();
    }

    @Transactional
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
}

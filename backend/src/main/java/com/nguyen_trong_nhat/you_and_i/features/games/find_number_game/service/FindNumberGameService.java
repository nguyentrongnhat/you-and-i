package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.common.exception.UnauthorizedException;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.*;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameUserBestRecord;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper.FindNumberGameDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameUserBestRecordRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class FindNumberGameService {
    private final FindNumberGameRepository findNumberGameRepository;
    private final FindNumberGameBestRecordService findNumberGameBestRecordService;
    private final UserRepository userRepository;

    public FindNumberGame createNewGame(String userName, CreateNewFindNumberGameRequest gameInfo) {

        Optional<MyUserDetail> playerOpt = userRepository.findByUsername(userName);

        if(playerOpt.isEmpty()) throw new BadRequestException("");

        MyUserDetail player = playerOpt.get();

        var gamesAreNotFinish = findNumberGameRepository.findByPlayerAndEndTimeIsNull(player);

        findNumberGameRepository.deleteAll(gamesAreNotFinish);

        List<FindNumberGameUserBestRecord> bestRecords = findNumberGameRepository.findBestGamesForRanking()
                .stream().map(game -> {
                    var bestRecord = new FindNumberGameUserBestRecord();
                    bestRecord.setBestGame(game);
                    bestRecord.setPlayer(game.getPlayer());
                    bestRecord.setBestCompletionTime(game.getCompletionTime());
                    return bestRecord;
                }).toList();



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

        findNumberGameBestRecordService.updateBestRecordForUser(game.getPlayer(), game);

        return findNumberGameRepository.save(game);
    }


    public List<FindNumberGameHistoryResponse> getGameHistory(String userName) {

        Optional<MyUserDetail> playerOpt = userRepository.findByUsername(userName);

        if(playerOpt.isEmpty()) throw new BadRequestException("User not found!");

        MyUserDetail player = playerOpt.get();

        List<FindNumberGame> gameFinished = findNumberGameRepository.findByPlayerAndEndTimeIsNotNull(player);

        return gameFinished.stream().map(game ->
            new FindNumberGameHistoryResponse(
                    game.getStartTime(),
                    game.getEndTime(),
                    game.getCompletionTime(),
                    game.getBonusTime()
            )
        ).toList();
    }


    public List<FindNumberGameDTO> getUnfinishedGamesForCurrentUser() {
        String username = SecurityUtils.getLoggedInUsername();
        MyUserDetail user = userRepository.findByUsername(username).orElseThrow(() -> new BadRequestException("User not found!"));
        return findNumberGameRepository.findByPlayerAndEndTimeIsNull(user).stream().map(FindNumberGameDataMapper::toDTO).toList();
    }
}

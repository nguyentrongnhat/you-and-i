package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.UnauthorizedException;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.CreateNewFindNumberGameRequest;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FinishFindNumberGameRequest;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameHistoryResponse;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FindNumberGameService {
    private final FindNumberGameRepository findNumberGameRepository;
    private final UserRepository userRepository;

    public FindNumberGame createNewGame(String userName, CreateNewFindNumberGameRequest gameInfo) {
        Optional<MyUserDetail> playerOpt = userRepository.findByUsername(userName);

        if(playerOpt.isEmpty()) throw new BadRequestException("");

        MyUserDetail player = playerOpt.get();

        var gamesAreNotFinish = findNumberGameRepository.findByEndTimeIsNull();
        findNumberGameRepository.deleteAll(gamesAreNotFinish);

        var newGame = new FindNumberGame();
        newGame.setBonusTime(0);
        newGame.setStartTime(gameInfo.getStartTime());
        newGame.setPlayer(player);

        newGame = findNumberGameRepository.save(newGame);

        return newGame;
    }

    public FindNumberGame finishGame(String userName, FinishFindNumberGameRequest gameInfo) {
        Optional<FindNumberGame> gameOpt = findNumberGameRepository.findById(gameInfo.getGameId());
        if(gameOpt.isEmpty()) throw new BadRequestException("");

        FindNumberGame game = gameOpt.get();

        if(!game.getPlayer().getUsername().equals(userName)) {
            throw new UnauthorizedException("You are not player, so you can not finish the game!!!");
        }

        game.setTimeToFinish(gameInfo.getTimeToFinish());
        game.setEndTime(gameInfo.getEndTime());

        return findNumberGameRepository.save(game);
    }

    public List<FindNumberGameHistoryResponse> getGameHistory(String userName) {
        Optional<MyUserDetail> playerOpt = userRepository.findByUsername(userName);

        if(playerOpt.isEmpty()) throw new BadRequestException("");

        MyUserDetail player = playerOpt.get();

        List<FindNumberGame> gameFinished = findNumberGameRepository.findByPlayerAndEndTimeIsNotNull(player);

        return gameFinished.stream().map(game -> {
            return new FindNumberGameHistoryResponse(game.getStartTime(), game.getEndTime(), game.getTimeToFinish(), game.getBonusTime());
        }).toList();
    }
}

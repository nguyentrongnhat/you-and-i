package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.controller;

import com.nguyen_trong_nhat.you_and_i.common.exception.UnauthorizedException;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.CreateNewFindNumberGameRequest;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.CreateNewFindNumberGameResponse;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FinishFindNumberGameRequest;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.FindNumberGameHistoryResponse;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service.FindNumberGameService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/game/find-number-game")
@AllArgsConstructor
public class FindNumberGameController {
    private final FindNumberGameService findNumberGameService;

    @PostMapping("")
    public ResponseEntity<CreateNewFindNumberGameResponse> createNewGame(@RequestBody CreateNewFindNumberGameRequest gameInfo) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        var newGame = this.findNumberGameService.createNewGame(userName, gameInfo);
        var newGameInfo = new CreateNewFindNumberGameResponse(newGame.getId(), newGame.getStartTime());
        return ResponseEntity.ok().body(newGameInfo);
    }

    @PostMapping("/finish-game")
    public ResponseEntity<FindNumberGame> finishGame(@RequestBody FinishFindNumberGameRequest gameInfo) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        var gameFinished = this.findNumberGameService.finishGame(userName, gameInfo);
        return ResponseEntity.ok().body(gameFinished);
    }

    @GetMapping("/history")
    public ResponseEntity<List<FindNumberGameHistoryResponse>> getGameHistory() {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        var history = this.findNumberGameService.getGameHistory(userName);
        return ResponseEntity.ok().body(history);
    }
}

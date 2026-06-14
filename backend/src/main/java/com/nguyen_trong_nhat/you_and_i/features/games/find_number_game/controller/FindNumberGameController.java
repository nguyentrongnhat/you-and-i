package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.UnauthorizedException;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.*;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper.FindNumberGameDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service.FindNumberGameService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/game/find-number-game")
@AllArgsConstructor
public class FindNumberGameController {
    private final FindNumberGameService findNumberGameService;

    @PostMapping("")
    public ResponseEntity<FindNumberGameDTO> createNewGame(@RequestBody CreateNewFindNumberGameRequest gameInfo) {
        String userName = SecurityUtils.getLoggedInUsername();
        var newGameEntity = this.findNumberGameService.createNewGame(userName, gameInfo);
        var newGameDTO = FindNumberGameDataMapper.toDTO(newGameEntity);
        return ResponseEntity.ok().body(newGameDTO);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<FindNumberGameDTO> getGameById(@PathVariable String gameId) {

        if(gameId == null) {
            throw new BadRequestException("Gameid is required");
        }

        FindNumberGame game = findNumberGameService.getGameById(gameId);

        if (SecurityUtils.getLoggedInUsername() != game.getPlayer().getUsername()
                && SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN)
                && SecurityUtils.hasAuthorities(Constants.ROLE_ADMIN)) {
            throw new UnauthorizedException("You have no Permission to access this data");
        }

        return ResponseEntity.ok().body(FindNumberGameDataMapper.toDTO(game));
    }

    @PostMapping("/finish-game")
    public ResponseEntity<FindNumberGameDTO> finishGame(@RequestBody FinishFindNumberGameRequest gameInfo) {
        String userName = SecurityUtils.getLoggedInUsername();
        var gameFinished = this.findNumberGameService.finishGame(userName, gameInfo);
        return ResponseEntity.ok().body(FindNumberGameDataMapper.toDTO(gameFinished));
    }

    @PutMapping("update")
    public ResponseEntity<FindNumberGameDTO> updateGame(@RequestBody FindNumberGameDTO gameDTO) {
        FindNumberGame gameEntity = findNumberGameService.updateGame(gameDTO);
        return ResponseEntity.ok().body(FindNumberGameDataMapper.toDTO(gameEntity));
    }

    @GetMapping("/history")
    public ResponseEntity<List<FindNumberGameHistoryResponse>> getGameHistory() {
        String userName = SecurityUtils.getLoggedInUsername();
        var history = this.findNumberGameService.getGameHistory(userName);
        return ResponseEntity.ok().body(history);
    }
}

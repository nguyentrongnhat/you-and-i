package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.controller;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.dto.CreateNewFindNumberGameResponse;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service.FindNumberGameService;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/game/find-number-game")
@AllArgsConstructor
public class FindNumberGameController {
    private final FindNumberGameService findNumberGameService;

    @GetMapping("")
    public ResponseEntity<CreateNewFindNumberGameResponse> createNewGame(@AuthenticationPrincipal MyUserDetail user) {
        var newGame = this.findNumberGameService.createNewGame(user);
        var newGameInfo =
                new CreateNewFindNumberGameResponse(newGame.getId(), newGame.getStartTime());
        return ResponseEntity.ok().body(newGameInfo);
    }
}

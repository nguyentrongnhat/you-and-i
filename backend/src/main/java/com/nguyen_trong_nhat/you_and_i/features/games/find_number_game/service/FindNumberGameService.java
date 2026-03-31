package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@AllArgsConstructor
public class FindNumberGameService {
    private final FindNumberGameRepository findNumberGameRepository;

    public FindNumberGame createNewGame(MyUserDetail player) {
        var newGame = new FindNumberGame();
        newGame.setBonusTime(0);
        newGame.setStartTime(Instant.now());
        return newGame;
    }
}

package com.nguyen_trong_nhat.you_and_i.bootstrap;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service.FindNumberGameBestRecordService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@AllArgsConstructor
public class MigrateFindNumberGameBestRecord implements ApplicationRunner {
    private final FindNumberGameRepository findNumberGameRepository;
    private final FindNumberGameBestRecordService findNumberGameBestRecordService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        migrateFindNumberGameBestRecord();
    }

    @Transactional
    private void migrateFindNumberGameBestRecord() {
        List<FindNumberGame> bestRecords = findNumberGameRepository.findBestGamesForRanking();
        bestRecords.forEach(game
                -> this.findNumberGameBestRecordService
                            .updateBestRecordForUser(game.getPlayer(), game));
    }
}

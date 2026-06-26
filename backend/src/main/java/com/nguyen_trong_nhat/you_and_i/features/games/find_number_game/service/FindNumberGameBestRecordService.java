package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameStatsRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FindNumberGameBestRecordService {
    private final FindNumberGameStatsRepository findNumberGameStatsRepository;

    private final FindNumberGameRepository findNumberGameRepository;

    private void migrateFindNumberGameBestRecord() {
        List<FindNumberGame> bestRecords = findNumberGameRepository.findBestGamesForRanking();
        bestRecords.forEach(game
                -> this.updateGameStatsForUser(game.getPlayer(), game, false));
    }

    @Transactional
    public FindNumberGameStats updateGameStatsForUser(MyUserDetail user, FindNumberGame game, boolean increaseTotalGamePlayed) {

        Optional<FindNumberGameStats> recordOpt = findNumberGameStatsRepository.findByPlayer(user);

        if(recordOpt.isEmpty()) {
            FindNumberGameStats newRecord = new FindNumberGameStats();
            newRecord.setTotalGamesPlayed(1);
            newRecord.setBestRecordGame(game);
            newRecord.setBestCompletionTime(game.getCompletionTime());
            newRecord.setPlayer(user);
            return findNumberGameStatsRepository.save(newRecord);
        }

        FindNumberGameStats existingRecord = recordOpt.get();

        if(increaseTotalGamePlayed) {
            existingRecord.setTotalGamesPlayed(existingRecord.getTotalGamesPlayed() + 1);
        }

        if (existingRecord.getBestCompletionTime() <= game.getCompletionTime()) {
            return findNumberGameStatsRepository.save(existingRecord);
        };

        existingRecord.setBestRecordGame(game);
        existingRecord.setBestCompletionTime(game.getCompletionTime());

        return findNumberGameStatsRepository.save(existingRecord);
    }

    public List<FindNumberGameStats> getBestRecordRanking() {
        return findNumberGameStatsRepository.findAll();
    }

    public FindNumberGameStats getGameStatsByPlayerUsername(String playerUsername) {
        return findNumberGameStatsRepository.findByPlayerUsername(playerUsername).orElse(null);
    }
}

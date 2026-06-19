package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGame;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameUserBestRecord;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.mapper.FindNumberGameDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameUserBestRecordRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FindNumberGameBestRecordService {
    private final FindNumberGameUserBestRecordRepository findNumberGameUserBestRecordRepository;

    private final FindNumberGameRepository findNumberGameRepository;

    private void migrateFindNumberGameBestRecord() {
        List<FindNumberGame> bestRecords = findNumberGameRepository.findBestGamesForRanking();
        bestRecords.forEach(game
                -> this.updateBestRecordForUser(game.getPlayer(), game));
    }

    @Transactional
    public void updateBestRecordForUser(MyUserDetail user, FindNumberGame game) {

        Optional<FindNumberGameUserBestRecord> recordOpt = findNumberGameUserBestRecordRepository.findByPlayer(user);

        if(recordOpt.isEmpty()) {
            FindNumberGameUserBestRecord newRecord = new FindNumberGameUserBestRecord();
            newRecord.setBestGame(game);
            newRecord.setBestCompletionTime(game.getCompletionTime());
            newRecord.setPlayer(user);
            findNumberGameUserBestRecordRepository.save(newRecord);
            return;
        }

        FindNumberGameUserBestRecord existingRecord = recordOpt.get();
        if (existingRecord.getBestCompletionTime() <= game.getCompletionTime()) return;

        existingRecord.setBestGame(game);
        existingRecord.setBestCompletionTime(game.getCompletionTime());

        findNumberGameUserBestRecordRepository.save(existingRecord);
    }

    public List<FindNumberGameUserBestRecord> getBestRecordRanking() {
        return findNumberGameUserBestRecordRepository.findAll();
    }
}

package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameStatsRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class FindNumberGameBestRecordCacheService {
    private final FindNumberGameStatsRepository findNumberGameStatsRepository;
    private final FindNumberGameRepository findNumberGameRepository;

    @Cacheable(value = Constants.CACHE_FIND_NUMBER_BEST_RECORD_RANKING)
    public List<FindNumberGameStats> getBestRecordRanking() {
        log.info("Fetching best record ranking from database");
        return findNumberGameStatsRepository.findAll();
    }

    @CacheEvict(value = Constants.CACHE_FIND_NUMBER_BEST_RECORD_RANKING, allEntries = true)
    public void evictBestRecordRankingCache() {
        log.info("Evicting best record ranking cache");
    }
}

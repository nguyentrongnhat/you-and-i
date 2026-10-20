package com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.entity.FindNumberGameStats;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameRepository;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.repository.FindNumberGameStatsRepository;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipCacheService;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipMemberService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class FindNumberGameBestRecordCacheService {
    private final FindNumberGameStatsRepository findNumberGameStatsRepository;
    private final FindNumberGameRepository findNumberGameRepository;
    private final RelationshipMemberService relationshipMemberService;

    @Cacheable(value = Constants.CACHE_FIND_NUMBER_BEST_RECORD_RANKING)
    public List<FindNumberGameStats> getAllBestRecordRanking() {
        log.info("Fetching all best record ranking from database");
        return findNumberGameStatsRepository.findAll();
    }

    @Cacheable(value = Constants.CACHE_FIND_NUMBER_BEST_RECORD_RANKING_BY_USERNAME, key = "#username")
    public List<FindNumberGameStats> getBestRecordRankingByUsername(String username) {
        log.info("Fetching best record ranking by username from database");
        var relativeRelationshipMembers = relationshipMemberService.getRelativeRelationshipMembersByUsername(username);
        return findNumberGameStatsRepository.findAll()
                .stream()
                .filter(stats
                        -> relativeRelationshipMembers.stream()
                        .anyMatch(member
                                -> member.getUser().getUsername().equals(stats.getPlayer().getUsername())
                        ) || stats.getPlayer().getUsername().equals(username)
                ).toList();
    }

    @Caching(evict = {
            @CacheEvict(value = Constants.CACHE_FIND_NUMBER_BEST_RECORD_RANKING, allEntries = true),
            @CacheEvict(value = Constants.CACHE_FIND_NUMBER_BEST_RECORD_RANKING_BY_USERNAME, allEntries = true)
    })
    public void evictBestRecordRankingCache() {
        log.info("Evicting best record ranking cache");
    }
}

package com.nguyen_trong_nhat.you_and_i.features.relationship.service;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.repository.RelationshipRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Cache proxy for relationship read operations.
 * Every relationship read exposed by the API must go through this service.
 */
@Service
@AllArgsConstructor
@Slf4j
public class RelationshipCacheService {

    private final RelationshipRepository relationshipRepository;

    @Transactional
    @Cacheable(value = Constants.CACHE_RELATIONSHIP_LIST, key = Constants.CACHE_RELATIONSHIP_LIST_KEY)
    public List<Relationship> getAllRelationships() {
        log.info("Cache MISS '{}' -> get all relationships from DB", Constants.CACHE_RELATIONSHIP_LIST);
        return relationshipRepository.findAll();
    }

    @Transactional
    @Cacheable(value = Constants.CACHE_RELATIONSHIP_BY_USER, key = "#username")
    public List<Relationship> getRelationshipsByUsername(String username) {
        log.info("Cache MISS '{}' key='{}' -> get relationships of user from DB",
                Constants.CACHE_RELATIONSHIP_BY_USER, username);

        return relationshipRepository.findByMembers_User_Username(username);
    }

    @CacheEvict(value = Constants.CACHE_RELATIONSHIP_LIST, allEntries = true)
    public void evictRelationshipList() {
        log.info("Evicting cache '{}' -> relationship list cache evicted", Constants.CACHE_RELATIONSHIP_LIST);
    }

    @CacheEvict(value = Constants.CACHE_RELATIONSHIP_BY_USER, key = "#username")
    public void evictRelationshipsByUsername(String username) {
        log.info("Evicting cache '{}' key='{}' -> user relationships cache evicted",
                Constants.CACHE_RELATIONSHIP_BY_USER, username);
    }

    @Caching(evict = {
            @CacheEvict(value = Constants.CACHE_RELATIONSHIP_LIST, allEntries = true),
            @CacheEvict(value = Constants.CACHE_RELATIONSHIP_BY_USER, allEntries = true)
    })
    public void evictAllRelationshipCaches() {
        log.info("Evicting caches '{}' and '{}' -> all relationship caches evicted",
                Constants.CACHE_RELATIONSHIP_LIST, Constants.CACHE_RELATIONSHIP_BY_USER);
    }
}

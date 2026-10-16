package com.nguyen_trong_nhat.you_and_i.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {

        CaffeineCacheManager cacheManager = new CaffeineCacheManager(Constants.CACHE_USER_DETAILS);

        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .maximumSize(1000)
                        .expireAfterWrite(Duration.ofMinutes(30))
                        .recordStats()
        );

        cacheManager.registerCustomCache(
                Constants.CACHE_FIND_NUMBER_GAME,
                Caffeine.newBuilder()
                        .maximumSize(1000)
                        .expireAfterWrite(Duration.ofMinutes(30))
                        .recordStats()
                        .build()
        );

        cacheManager.registerCustomCache(
                Constants.CACHE_FIND_NUMBER_GAME_HISTORY,
                Caffeine.newBuilder()
                        .maximumSize(500)
                        .expireAfterWrite(Duration.ofHours(12))
                        .recordStats()
                        .build()
        );

        cacheManager.registerCustomCache(
                Constants.CACHE_FIND_NUMBER_BEST_RECORD_RANKING,
                Caffeine.newBuilder()
                        .maximumSize(200)
                        .expireAfterWrite(Duration.ofHours(240))
                        .recordStats()
                        .build()
        );

        return cacheManager;
    }
}
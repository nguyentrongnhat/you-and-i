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

        CaffeineCacheManager cacheManager = new CaffeineCacheManager("userDetails");

        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .maximumSize(1000) // giới hạn số entry
                        .expireAfterWrite(Duration.ofMinutes(30)) // TTL
                        .recordStats() // debug hit/miss
        );

        return cacheManager;
    }
}
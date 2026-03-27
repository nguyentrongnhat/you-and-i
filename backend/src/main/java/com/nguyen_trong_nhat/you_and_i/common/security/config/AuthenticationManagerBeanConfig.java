package com.nguyen_trong_nhat.you_and_i.common.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;

import java.util.List;

@Configuration
public class AuthenticationManagerBeanConfig {
    @Bean
    public AuthenticationManager authenticationManager(List<AuthenticationProvider> providers) throws Exception {
        return new ProviderManager(providers);
    }
}

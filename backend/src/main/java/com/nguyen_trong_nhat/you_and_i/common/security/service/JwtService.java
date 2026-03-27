package com.nguyen_trong_nhat.you_and_i.common.security.service;

import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;

public interface JwtService {
    String generateAccessToken(UserDetails user);

    String generateRefreshToken(UserDetails user);

    boolean isTokenValid(String token);

    String extractUsername(String token);

    List<String> extractRoles(String token);
}

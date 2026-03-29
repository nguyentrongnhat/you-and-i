package com.nguyen_trong_nhat.you_and_i.common.security.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.security.service.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
public class JwtServiceImpl implements JwtService {

    private final SecretKey key = Keys.hmacShaKeyFor("super-secure-key-super-secure-key".getBytes());

    public String generateAccessToken(UserDetails user) {
        return Jwts.builder()
                .issuer(Constants.SYSTEM_NAME)
                .subject(user.getUsername())
                .claim("type", Constants.TOKEN_TYPE_ACCESS_TOKEN)
                .claim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                .issuedAt(new Date())
                .expiration(Date.from(Instant.now().plusSeconds(Constants.ACCESS_TOKEN_MAX_AGE)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(UserDetails user) {
        return Jwts.builder()
                .issuer(Constants.SYSTEM_NAME)
                .subject(user.getUsername())
                .claim("type", Constants.TOKEN_TYPE_REFRESH_TOKEN)
                .issuedAt(new Date())
                .expiration(Date.from(Instant.now().plusSeconds(Constants.REFRESH_TOKEN_MAX_AGE)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            Date expiration = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();
            return expiration != null && expiration.after(Date.from(Instant.now()));
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public List<String> extractRoles(String token) {
        Object roles = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload().get("roles");

        if (roles instanceof List<?>) {
            return ((List<?>) roles).stream()
                    .map(Object::toString)
                    .toList();
        }
        return Collections.emptyList();
    }
}

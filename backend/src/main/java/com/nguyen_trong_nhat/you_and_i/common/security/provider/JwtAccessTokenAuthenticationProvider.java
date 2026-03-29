package com.nguyen_trong_nhat.you_and_i.common.security.provider;

import com.nguyen_trong_nhat.you_and_i.common.security.authentication.JwtAccessTokenAuthentication;
import com.nguyen_trong_nhat.you_and_i.common.security.service.impl.JwtServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAccessTokenAuthenticationProvider implements AuthenticationProvider {

    private final JwtServiceImpl jwtService;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {

        String token = (String) authentication.getCredentials();

        if (!jwtService.isTokenValid(token)) {
            return null;
        }

        String username = jwtService.extractUsername(token);

        List<SimpleGrantedAuthority> authorities = jwtService.extractRoles(token).stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        UserDetails userDetails = new User(username, null, authorities);

        return new JwtAccessTokenAuthentication(userDetails, authorities);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return JwtAccessTokenAuthentication.class.isAssignableFrom(authentication);
    }
}
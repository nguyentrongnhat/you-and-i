package com.nguyen_trong_nhat.you_and_i.common.security.provider;

import com.nguyen_trong_nhat.you_and_i.common.security.authentication.JwtAccessTokenAuthentication;
import com.nguyen_trong_nhat.you_and_i.common.security.authentication.JwtRefreshTokenAuthentication;
import com.nguyen_trong_nhat.you_and_i.common.security.service.impl.JwtServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtRefreshTokenAuthenticationProvider implements AuthenticationProvider {

    private final JwtServiceImpl jwtService;
    private final UserDetailsService userService;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String token = (String) authentication.getCredentials();

        if (!jwtService.isTokenValid(token)) {
            return null;
        }

        String username = jwtService.extractUsername(token);

        UserDetails user = userService.loadUserByUsername(username);

        return new JwtAccessTokenAuthentication(user, user.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return JwtRefreshTokenAuthentication.class.isAssignableFrom(authentication);
    }
}
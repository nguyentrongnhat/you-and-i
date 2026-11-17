package com.nguyen_trong_nhat.you_and_i.common.security.provider;

import com.nguyen_trong_nhat.you_and_i.common.security.authentication.GoogleLoginAuthentication;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleLoginAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userService;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new BadCredentialsException("Google email is required");
        }

        try {
            MyUserDetail user = (MyUserDetail) userService.loadUserByUsername(email.trim().toLowerCase());

            if (!user.isEnabled()) {
                throw new BadCredentialsException("This account is not active");
            }

            if (!user.isEmailVerified()) {
                throw new BadCredentialsException("This account email has not been verified");
            }

            log.info("Google login successful for user: {}", email);
            return new GoogleLoginAuthentication(user, user.getAuthorities());
        } catch (Exception ex) {
            throw new BadCredentialsException("Google account not found in local system", ex);
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return GoogleLoginAuthentication.class.isAssignableFrom(authentication);
    }
}


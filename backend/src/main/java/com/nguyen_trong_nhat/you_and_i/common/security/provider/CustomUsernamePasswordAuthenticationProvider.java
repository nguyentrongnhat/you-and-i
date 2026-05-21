package com.nguyen_trong_nhat.you_and_i.common.security.provider;

import com.nguyen_trong_nhat.you_and_i.common.exception.UnauthorizedException;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@AllArgsConstructor
@Slf4j
public class CustomUsernamePasswordAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userService;
    private final PasswordEncoder encoder;

    @Override
    public Authentication authenticate(Authentication auth) {
        String username = auth.getName();
        String password = Objects.requireNonNull(auth.getCredentials()).toString();


        MyUserDetail user = (MyUserDetail) userService.loadUserByUsername(username);

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("The email for this account has not been verified yet. Please go to the sign-up page to verify your account.");
        }

        if (!user.isEnabled()) {
            throw new UnauthorizedException("This account has not been activated yet. Please wait for the system to activate your account.");
        }

        if (!encoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        return new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities());
    }

    @Override
    @NullMarked
    public boolean supports(Class<?> auth) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(auth);
    }
}

package com.nguyen_trong_nhat.you_and_i.common.security.authentication;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;

@Getter
public class GoogleLoginAuthentication extends AbstractAuthenticationToken {

    private final Object principal;
    private final Object credentials;

    public GoogleLoginAuthentication(String email) {
        super(Collections.emptyList());
        this.principal = email;
        this.credentials = email;
        setAuthenticated(false);
    }

    public GoogleLoginAuthentication(Object principal, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = null;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return credentials;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }
}


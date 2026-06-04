package com.nguyen_trong_nhat.you_and_i.common.security.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Objects;

public class SecurityUtils {

    public static UserDetails getLoggedInUser() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                return (UserDetails) principal;
            }
        }

        return null;
    }


    public static String getLoggedInUsername() {
        UserDetails userDetails = getLoggedInUser();
        return userDetails != null ? userDetails.getUsername() : null;
    }


    public static boolean hasAuthorities(String roleName) {
        if (roleName == null || roleName.isEmpty()) {
            return false;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String roleToCheck = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> Objects.equals(authority, roleToCheck));
    }
}

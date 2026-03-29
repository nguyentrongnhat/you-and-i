package com.nguyen_trong_nhat.you_and_i.common.config;

public class Constants {
    public static final String SYSTEM_NAME = "you-and-i";
    // Token Const
    public static final String TOKEN_TYPE_ACCESS_TOKEN = "access_token";
    public static final String TOKEN_TYPE_REFRESH_TOKEN = "refresh_token";
    public static final Integer REFRESH_TOKEN_MAX_AGE = 3600;
    public static final Integer ACCESS_TOKEN_MAX_AGE = 20;

    // Otp Const
    public static final Integer OTP_LENGTH = 6;

    // Role Const
    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_USER = "ROLE_USER";
}

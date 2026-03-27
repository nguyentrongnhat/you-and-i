package com.nguyen_trong_nhat.you_and_i.common.util;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;

import java.security.SecureRandom;

public class OtpGenerator {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_LENGTH = Constants.OTP_LENGTH;
    private static final int OTP_BOUND = (int) Math.pow(10, OTP_LENGTH);

    public static String generate() {
        int number = SECURE_RANDOM.nextInt(OTP_BOUND);
        return String.format("%0" + OTP_LENGTH + "d", number);
    }
}

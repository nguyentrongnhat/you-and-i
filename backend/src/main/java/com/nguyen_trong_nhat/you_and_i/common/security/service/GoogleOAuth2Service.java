package com.nguyen_trong_nhat.you_and_i.common.security.service;

import com.nguyen_trong_nhat.you_and_i.common.security.dto.GoogleUserInfo;
import com.nguyen_trong_nhat.you_and_i.features.mail.dto.GoogleTokenResponse;

public interface GoogleOAuth2Service {
    GoogleTokenResponse exchangeAuthorizationCode(String code);
    GoogleUserInfo getUserInfo(String accessToken);
}

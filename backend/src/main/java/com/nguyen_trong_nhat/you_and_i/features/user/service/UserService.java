package com.nguyen_trong_nhat.you_and_i.features.user.service;

import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;

public interface UserService {
    MyUserDetail createUserWithUsernameAndPassword(String username, String password);

    UserVerification createUserVerificationCode(MyUserDetail user);
}

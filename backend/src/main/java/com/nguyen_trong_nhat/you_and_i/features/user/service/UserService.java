package com.nguyen_trong_nhat.you_and_i.features.user.service;

import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserProfile;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;

import java.util.List;

public interface UserService {
    MyUserDetail createUserWithUsernameAndPassword(String username, String password);

    UserVerification createUserVerificationCode(MyUserDetail user);

    List<MyUserDetail> getAllUser();

    UserProfile createUserProfile(MyUserDetail user);

    void initSuperAdminAccount(String username, String password);
}

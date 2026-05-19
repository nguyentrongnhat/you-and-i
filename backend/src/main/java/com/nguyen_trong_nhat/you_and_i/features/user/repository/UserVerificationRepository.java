package com.nguyen_trong_nhat.you_and_i.features.user.repository;

import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserVerificationRepository extends JpaRepository <UserVerification, UUID> {
    List<UserVerification> findUserVerificationByUser(MyUserDetail user);
}

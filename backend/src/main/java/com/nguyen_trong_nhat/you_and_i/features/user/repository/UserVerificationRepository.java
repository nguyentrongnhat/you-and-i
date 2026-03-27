package com.nguyen_trong_nhat.you_and_i.features.user.repository;

import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserVerificationRepository extends JpaRepository <UserVerification, UUID> {
}

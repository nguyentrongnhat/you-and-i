package com.nguyen_trong_nhat.you_and_i.features.user.repository;

import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<MyUserDetail, UUID> {
    Optional<MyUserDetail> findByUsername(String username);

    List<MyUserDetail> findAllByRoles_Name(String roleName);
}

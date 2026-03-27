package com.nguyen_trong_nhat.you_and_i.features.user.repository;

import com.nguyen_trong_nhat.you_and_i.features.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String roleName);
}

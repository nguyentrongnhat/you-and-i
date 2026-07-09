package com.nguyen_trong_nhat.you_and_i.features.role.repository;

import com.nguyen_trong_nhat.you_and_i.features.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String roleName);

    Set<Role> findByNameIn(Collection<String> roleNames);
}

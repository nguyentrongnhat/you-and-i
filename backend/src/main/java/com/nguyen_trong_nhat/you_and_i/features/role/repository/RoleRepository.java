package com.nguyen_trong_nhat.you_and_i.features.role.repository;

import com.nguyen_trong_nhat.you_and_i.features.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String roleName);

    Set<Role> findByNameIn(Collection<String> roleNames);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Role r WHERE r.name = :name")
    int deleteRoleByName(@Param("name") String name);
}

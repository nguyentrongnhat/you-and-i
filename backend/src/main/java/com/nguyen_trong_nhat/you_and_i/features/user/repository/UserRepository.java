package com.nguyen_trong_nhat.you_and_i.features.user.repository;

import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<MyUserDetail, UUID> {
    Optional<MyUserDetail> findByUsername(String username);

    @EntityGraph(attributePaths = {"profile", "roles"})
    Optional<MyUserDetail> findByUsernameIgnoreCase(String username);

    @EntityGraph(attributePaths = {"profile", "roles"})
    Page<MyUserDetail> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = {"profile", "roles"})
    Optional<MyUserDetail> findDetailedById(UUID id);

    List<MyUserDetail> findAllByRoles_Name(String roleName);
}

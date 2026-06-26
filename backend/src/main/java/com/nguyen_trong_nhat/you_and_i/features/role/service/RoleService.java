package com.nguyen_trong_nhat.you_and_i.features.role.service;

import com.nguyen_trong_nhat.you_and_i.features.role.repository.RoleRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.Role;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    public List<Role> getAllRole () {
        return roleRepository.findAll();
    }
}

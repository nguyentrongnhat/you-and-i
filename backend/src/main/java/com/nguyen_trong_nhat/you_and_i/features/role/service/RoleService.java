package com.nguyen_trong_nhat.you_and_i.features.role.service;

import com.nguyen_trong_nhat.you_and_i.features.role.repository.RoleRepository;
import com.nguyen_trong_nhat.you_and_i.features.role.entity.Role;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    public List<Role> getAllRole () {
        return roleRepository.findAll();
    }

    public Role createNewRole(String roleName) {
        Role existingRole = this.getRoleByName(roleName);
        if(existingRole != null) {
            return existingRole;
        }
        Role newRole = new Role();
        newRole.setName(roleName);
        return roleRepository.save(newRole);
    }

    public Role getRoleByName (String roleName) {
        return roleRepository.findByName(roleName).orElse(null);
    }

    @Transactional
    public int deleteByName(String roleName) {
        return roleRepository.deleteRoleByName(roleName);
    }
}

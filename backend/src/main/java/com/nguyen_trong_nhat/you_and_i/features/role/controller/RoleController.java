package com.nguyen_trong_nhat.you_and_i.features.role.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.features.role.service.RoleService;
import com.nguyen_trong_nhat.you_and_i.features.role.entity.Role;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("api/role")
public class RoleController {
    private final RoleService roleService;

    @PreAuthorize("hasAuthority('" + Constants.ROLE_SUPER_ADMIN + "')")
    @GetMapping("")
    public ResponseEntity<List<String>> getAll() {
        List<String> roleNames = roleService.getAllRole().stream().map(Role::getName).toList();
        return ResponseEntity.ok(roleNames);
    }

    @PreAuthorize("hasAuthority('" + Constants.ROLE_SUPER_ADMIN + "')")
    @PostMapping("")
    public ResponseEntity<String> create(@RequestBody String roleName) {
        Role role = roleService.createNewRole(roleName);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{roleName}")
                .buildAndExpand(role.getName())
                .toUri();
        return ResponseEntity.created(location).body(role.getName());
    }

    @PreAuthorize("hasAnyAuthority('" + Constants.ROLE_SUPER_ADMIN + "')")
    @GetMapping("/{name}")
    public ResponseEntity<Role> getByName(@PathVariable String name) {
        Role role = roleService.getRoleByName(name);
        if(role == null) {
            throw new NotFoundException("Role not found: " + name);
        }
        return ResponseEntity.ok(role);
    }

    @PreAuthorize("hasAuthority('" + Constants.ROLE_SUPER_ADMIN + "')")
    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteByRoleName(@PathVariable String name) {
        roleService.deleteByName(name);
        return ResponseEntity.noContent().build();
    }
}

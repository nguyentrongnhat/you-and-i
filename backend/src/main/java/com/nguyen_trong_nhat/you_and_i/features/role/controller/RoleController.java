package com.nguyen_trong_nhat.you_and_i.features.role.controller;

import com.nguyen_trong_nhat.you_and_i.features.role.service.RoleService;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.Role;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("api/role")
public class RoleController {
    private final RoleService roleService;

    @GetMapping("")
    public ResponseEntity<List<String>> getAllRoles() {
        List<String> roleNames = roleService.getAllRole().stream().map(Role::getName).toList();
        return ResponseEntity.ok(roleNames);
    }
}

package com.nguyen_trong_nhat.you_and_i.features.user.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.ForbidenException;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.common.util.OtpGenerator;
import com.nguyen_trong_nhat.you_and_i.features.role.repository.RoleRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UpdateUserRequest;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.role.entity.Role;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserProfile;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;
import com.nguyen_trong_nhat.you_and_i.features.user.mapper.UserDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserProfileRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private static final int MAX_PAGE_SIZE = 100;

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserDataMapper userDataMapper;

    @Override
    @CacheEvict(value = "userDetails", key = "#username.toLowerCase()")
    public MyUserDetail createUserWithUsernameAndPassword(String username, String password) {
        Optional<Role> defaultRoleOpt = roleRepository.findByName(Constants.ROLE_GUEST);

        if(defaultRoleOpt.isEmpty()) {
            throw new RuntimeException("Not found ROLE_USER in database");
        }

        MyUserDetail user = new MyUserDetail();
        user.setUsername(username.toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(defaultRoleOpt.get()));
        user.setEnabled(false);
        user.setEmailVerified(false);

        return user;
    }

    @Override
    public UserVerification createUserVerificationCode(MyUserDetail user) {
        if(user.isEmailVerified()) {
            throw new BadRequestException(String.format("User %s was verified before.", user.getUsername()));
        }
        String verificationCode = OtpGenerator.generate();
        UserVerification uv = new UserVerification();
        uv.setUser(user);
        uv.setVerificationCode(verificationCode);
        uv.setExpiry(LocalDateTime.now().plusMinutes(30));

        return uv;
    }

    @Override
    public Page<UserDetailDTO> getAllUser(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        return userRepository.findAllBy(PageRequest.of(safePage, safeSize))
                .map(userDataMapper::toUserDetailDTO);
    }

    @Override
    @Transactional
    public UserProfile createUserProfile(MyUserDetail user) {
        Optional<UserProfile> userProfileOpt = userProfileRepository.findUserProfileByUser(user);
        if(userProfileOpt.isPresent()) {
            return userProfileOpt.get();
        }

        UserProfile newUserProfile = new UserProfile();
        newUserProfile.setUser(user);
        newUserProfile.setDisplayName(user.getUsername());
        return newUserProfile;
    }

    @Override
    @Transactional
    public void initSuperAdminAccount(String username, String password) {
        Optional<MyUserDetail> existingAccountOpt = userRepository.findByUsername(username);

        Role superAdminRole = roleRepository
                .findByName(Constants.ROLE_SUPER_ADMIN)
                .orElseThrow(() -> new NotFoundException("Super-Admin role does not exist in the system."));

        if(existingAccountOpt.isPresent()) {
            MyUserDetail existingAccount = existingAccountOpt.get();
            existingAccount.setPassword(passwordEncoder.encode(password));
            existingAccount.getRoles().add(superAdminRole);
            userRepository.save(existingAccount);
            return;
        }

        List<MyUserDetail> superAdminAccounts = userRepository.findAllByRoles_Name(superAdminRole.getName());

        if(!superAdminAccounts.isEmpty()) {
            userRepository.deleteAll(superAdminAccounts);
        }

        MyUserDetail superAdmin = this.createUserWithUsernameAndPassword(username, password);
        superAdmin.setRoles(Set.of(superAdminRole));
        superAdmin.setEnabled(true);
        superAdmin.setEnableAt(LocalDateTime.now());
        superAdmin.setEmailVerified(true);

        superAdmin = userRepository.save(superAdmin);
        UserProfile superAdminProfile = this.createUserProfile(superAdmin);
        superAdminProfile.setDisplayName("Super-Admin");
        userProfileRepository.save(superAdminProfile);
    }

    @Transactional
    @Override
    @CacheEvict(value = "userDetails", key = "#updateUserRequest.username.toLowerCase()")
    public UserDetailDTO updateUserData(UpdateUserRequest updateUserRequest) {
        String requestedUsername = updateUserRequest.getUsername().trim().toLowerCase();
        MyUserDetail existingAccount
                = userRepository.findByUsernameIgnoreCase(requestedUsername)
                    .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isSuperAdmin = SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN);
        boolean isAdmin = SecurityUtils.hasAuthorities(Constants.ROLE_ADMIN);
        boolean isSelf = Objects.equals(SecurityUtils.getLoggedInUsername(), existingAccount.getUsername());

        if (!isSelf && !isAdmin && !isSuperAdmin) {
            throw new ForbidenException("You have no permission to update this user's data");
        }

        if ((updateUserRequest.getRoles() != null
                || updateUserRequest.getEnabled() != null
                || updateUserRequest.getEmailVerified() != null)
                && !isAdmin && !isSuperAdmin) {
            throw new ForbidenException("You have no permission to update sensitive user fields");
        }

        existingAccount = userDataMapper.updateUserProfileFromRequest(updateUserRequest, existingAccount);

        if (isAdmin || isSuperAdmin) {
            existingAccount = userDataMapper.applyAdminFields(updateUserRequest, existingAccount);
        }

        userRepository.save(existingAccount);

        return userDataMapper.toUserDetailDTO(existingAccount);
    }

    @Override
    public UserDetailDTO getUserDetailsById(String id) {
        UUID userId = UUID.fromString(id);
        MyUserDetail user = userRepository.findDetailedById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        if(!Objects.equals(SecurityUtils.getLoggedInUsername(), user.getUsername())
                && !SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN)
                && !SecurityUtils.hasAuthorities(Constants.ROLE_ADMIN)
        ) {
            throw new ForbidenException("You have no permission to access this data");
        }
        return userDataMapper.toUserDetailDTO(user);
    }
}

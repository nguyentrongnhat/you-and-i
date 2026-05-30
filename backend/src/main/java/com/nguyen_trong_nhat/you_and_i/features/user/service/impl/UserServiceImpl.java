package com.nguyen_trong_nhat.you_and_i.features.user.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.common.util.OtpGenerator;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.Role;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserProfile;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.RoleRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserProfileRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    public MyUserDetail createUserWithUsernameAndPassword(String username, String password) {
        Optional<Role> defaultRoleOpt = roleRepository.findByName(Constants.ROLE_USER);

        if(defaultRoleOpt.isEmpty()) {
            throw new RuntimeException("Not found ROLE_USER in database");
        }

        MyUserDetail user = new MyUserDetail();
        user.setUsername(username);
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
        uv.setExpiry(LocalDateTime.now().plusMinutes(5));

        return uv;
    }

    @Override
    public List<MyUserDetail> getAllUser() {
        return userRepository.findAll();
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
            existingAccount.getRoles().add(superAdminRole);
            userRepository.save(existingAccount);
            return;
        };

        List<MyUserDetail> superAdminAccounts = userRepository.findAllByRoles_Name(superAdminRole.getName());

        if(!superAdminAccounts.isEmpty()) {
            userRepository.deleteAll(superAdminAccounts);
        }

        MyUserDetail superAdmin = this.createUserWithUsernameAndPassword(username, password);
        superAdmin.setRoles(Set.of(superAdminRole));
        superAdmin.setEnabled(true);
        superAdmin.setEmailVerified(true);

        superAdmin = userRepository.save(superAdmin);
        UserProfile superAdminProfile = this.createUserProfile(superAdmin);
        superAdminProfile.setDisplayName("Super-Admin");
        userProfileRepository.save(superAdminProfile);
    }
}

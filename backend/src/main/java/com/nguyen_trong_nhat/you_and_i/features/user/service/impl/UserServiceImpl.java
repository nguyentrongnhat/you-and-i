package com.nguyen_trong_nhat.you_and_i.features.user.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.util.OtpGenerator;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.Role;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.RoleRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.service.UserService;
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
}

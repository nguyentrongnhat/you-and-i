package com.nguyen_trong_nhat.you_and_i.common.security.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.dto.EmailVerificationRequest;
import com.nguyen_trong_nhat.you_and_i.common.dto.UsernamePasswordSignupRequest;
import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.ErrorConstant;
import com.nguyen_trong_nhat.you_and_i.common.dto.LoginResponse;
import com.nguyen_trong_nhat.you_and_i.common.security.authentication.JwtRefreshTokenAuthentication;
import com.nguyen_trong_nhat.you_and_i.common.security.service.AuthService;
import com.nguyen_trong_nhat.you_and_i.features.mail.service.MailService;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserVerificationRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final JwtServiceImpl jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserVerificationRepository userVerificationRepository;
    private final MailService mailService;
    private final UserService userService;


    @Override
    public LoginResponse usernamePasswordAuthenticate(String username, String password) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, password);
        UserDetails user = this.authenticate(authentication);
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new LoginResponse(accessToken, refreshToken, user.getUsername());
    }


    @Override
    public LoginResponse refreshTokenAuthenticate(String refreshToken) {
        Authentication authentication = new JwtRefreshTokenAuthentication(refreshToken);
        UserDetails user = this.authenticate(authentication);
        String accessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        return new LoginResponse(accessToken, newRefreshToken, user.getUsername());
    }


    @Override
    public UserDetails authenticate(Authentication authentication) {
        Authentication validateResult = authenticationManager.authenticate(authentication);
        SecurityContextHolder.getContext().setAuthentication(validateResult);
        return (UserDetails) validateResult.getPrincipal();
    }


    @Transactional
    @Override
    public void signup (UsernamePasswordSignupRequest signupData) {
        if(!signupData.getPassword().equals(signupData.getConfirmPassword())) {
            throw new BadRequestException(ErrorConstant.PASSWORDS_DO_NOT_MATCH);
        }

        Optional<MyUserDetail> existingUserOpt = userRepository.findByUsername(signupData.getUsername());

        if(existingUserOpt.isPresent()) {
            throw new BadRequestException(ErrorConstant.USERNAME_ALREADY_REGISTERED);
        }

        MyUserDetail newUser = userService.createUserWithUsernameAndPassword(signupData.getUsername(), signupData.getPassword());
        newUser = userRepository.save(newUser);
        this.createAndSendVerificationCodeForAccount(newUser.getUsername());
    }


    @Transactional
    public void verifyAccount(EmailVerificationRequest emailVerificationRequest) {
        MyUserDetail userNeedToVerify = userRepository.findByUsername(emailVerificationRequest.getEmail())
                .orElseThrow(() -> new BadRequestException(ErrorConstant.USER_NOT_REGISTERED));

        if(userNeedToVerify.isEmailVerified()) {
            throw new BadRequestException(ErrorConstant.EMAIL_ALREADY_VERIFIED);
        }

        List<UserVerification> userVerificationList = userVerificationRepository.findUserVerificationByUser(userNeedToVerify);
        if(userVerificationList.isEmpty()) {
            throw new RuntimeException("Not found any verification code for this account. Please get your verification code first!");
        }

        UserVerification userVerification = userVerificationList.stream()
                .filter(item -> item.getVerificationCode().equals(emailVerificationRequest.getVerificationCode())
                ).findFirst().orElseThrow(() -> new BadRequestException("Verification code is not correct"));

        userVerification.setUsed(true);
        userVerificationRepository.save(userVerification);
        userNeedToVerify.setEmailVerified(true);
        userRepository.save(userNeedToVerify);
        userService.createUserProfile(userNeedToVerify);
    }


    public void createAndSendVerificationCodeForAccount(String username) {
        MyUserDetail userNeedToVerify = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException(ErrorConstant.USER_NOT_REGISTERED));

        if(userNeedToVerify.isEmailVerified()) {
            throw new BadRequestException(ErrorConstant.EMAIL_ALREADY_VERIFIED);
        }

        UserVerification uv = userService.createUserVerificationCode(userNeedToVerify);
        userVerificationRepository.save(uv);
        log.info("{}: {}", "Verification Code", uv.getVerificationCode());

        mailService.sendHtmlMail(
                userNeedToVerify.getUsername(),
                "Jar of Messages - Verify your account",
                String.format("Your verification code is: %s.", uv.getVerificationCode())
        );
    }
}

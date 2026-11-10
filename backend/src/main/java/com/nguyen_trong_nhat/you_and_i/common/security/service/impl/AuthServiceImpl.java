package com.nguyen_trong_nhat.you_and_i.common.security.service.impl;

import com.nguyen_trong_nhat.you_and_i.common.dto.EmailVerificationRequest;
import com.nguyen_trong_nhat.you_and_i.common.dto.LoginResponse;
import com.nguyen_trong_nhat.you_and_i.common.dto.UsernamePasswordSignupRequest;
import com.nguyen_trong_nhat.you_and_i.common.exception.BadRequestException;
import com.nguyen_trong_nhat.you_and_i.common.exception.ErrorConstant;
import com.nguyen_trong_nhat.you_and_i.common.security.authentication.JwtRefreshTokenAuthentication;
import com.nguyen_trong_nhat.you_and_i.common.security.service.AuthService;
import com.nguyen_trong_nhat.you_and_i.features.mail.service.MailService;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.UserVerification;
import com.nguyen_trong_nhat.you_and_i.features.user.mapper.UserDataMapper;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserProfileRepository;
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
import java.time.LocalDateTime;

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
    private final UserProfileRepository userProfileRepository;
    private final UserDataMapper userDataMapper;

    private static final String VERIFICATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jar of Messages</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f6f8">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#4f46e5"
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 24px;">
              <img src="{{ICON_URL}}" alt="Jar of Messages" width="64" height="64"
                   style="display:block;margin:0 auto 12px;border:0;border-radius:16px;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:0.3px;">
                Jar of Messages
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 16px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Verify your email address</h2>
              <p style="margin:0;font-size:15px;line-height:24px;color:#4b5563;">
                Thanks for joining Jar of Messages. Use the verification code below to complete your registration.
              </p>
            </td>
          </tr>

          <!-- Code box -->
          <tr>
            <td align="center" style="padding:16px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#eef2ff"
                      style="background-color:#eef2ff;border:2px dashed #818cf8;border-radius:10px;padding:18px 36px;">
                    <span style="font-family:'Courier New',Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#4338ca;">
                      {{CODE}}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td align="center" style="padding:8px 40px 24px;">
              <p style="margin:0;font-size:14px;color:#6b7280;">
                This code will expire in <strong style="color:#111827;">30 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#fffbeb"
                      style="background-color:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;padding:12px 16px;font-size:13px;line-height:20px;color:#92400e;">
                    Never share this code with anyone. Our team will never ask you for it.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#f9fafb"
                style="background-color:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#9ca3af;">
                If you did not request this verification code, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; 2026 Jar of Messages. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
""";


    @Override
    public LoginResponse usernamePasswordAuthenticate(String username, String password) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, password);
        UserDetails user = this.authenticate(authentication);
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new LoginResponse(accessToken, refreshToken, userDataMapper.toUserDetailDTO((MyUserDetail) user));
    }


    @Override
    public LoginResponse refreshTokenAuthenticate(String refreshToken) {
        Authentication authentication = new JwtRefreshTokenAuthentication(refreshToken);
        UserDetails user = this.authenticate(authentication);
        String accessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        return new LoginResponse(accessToken, newRefreshToken, userDataMapper.toUserDetailDTO((MyUserDetail) user));
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
        userProfileRepository.save(userService.createUserProfile(newUser));
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
            throw new BadRequestException("Not found any verification code for this account. Please get your verification code first!");
        }

        UserVerification userVerification = userVerificationList.stream()
                .filter(item -> item.getVerificationCode().equals(emailVerificationRequest.getVerificationCode()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Verification code is not correct"));

        if(userVerification.getExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException(ErrorConstant.VERIFICATION_CODE_EXPIRED);
        }

        userVerification.setUsed(true);
        userVerificationRepository.save(userVerification);
        userNeedToVerify.setEmailVerified(true);
        userRepository.save(userNeedToVerify);
        userVerificationRepository.deleteAll(userVerificationList);
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
                "Your verification code for Jar of Messages",
                this.buildVerificationEmail(uv.getVerificationCode())
        );
        log.info("Email has been sent to {}", userNeedToVerify.getUsername());
    }

    private String buildVerificationEmail(String code) {
        return VERIFICATION_EMAIL_TEMPLATE
                .replace("{{CODE}}", code)
                .replace("{{ICON_URL}}", "https://lh3.googleusercontent.com/d/16SRGqR6ok75LE-YM9Skq4cpEvEOR-C58");
    }

    public void testSendVerificationEmail(String email) {
        String testCode = "123456";
        mailService.sendHtmlMail(
                email,
                "Test verification code for Jar of Messages",
                this.buildVerificationEmail(testCode)
        );
        log.info("Test email has been sent to {}", email);
    }
}

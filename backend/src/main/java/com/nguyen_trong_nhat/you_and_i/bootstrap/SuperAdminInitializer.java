package com.nguyen_trong_nhat.you_and_i.bootstrap;

import com.nguyen_trong_nhat.you_and_i.features.user.service.impl.UserServiceImpl;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SuperAdminInitializer implements ApplicationRunner {
    private final String username;
    private final String password;
    private final UserServiceImpl userService;

    public SuperAdminInitializer(
            @Value("${account.super-admin.username}") String username,
            @Value("${account.super-admin.password}") String password,
            UserServiceImpl userService) {

        this.username = username;
        this.password = password;
        this.userService = userService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        userService.initSuperAdminAccount(username, password);
    }
}

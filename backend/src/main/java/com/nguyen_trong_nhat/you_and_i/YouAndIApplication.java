package com.nguyen_trong_nhat.you_and_i;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class YouAndIApplication {

	public static void main(String[] args) {
		SpringApplication.run(YouAndIApplication.class, args);
	}

}

package com.example.AMRadioServer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
public class AmRadioServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(AmRadioServerApplication.class, args);
	}

}

package com.personalsite;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.personalsite.mapper")
public class PersonalSiteApplication {
    public static void main(String[] args) {
        SpringApplication.run(PersonalSiteApplication.class, args);
    }
}

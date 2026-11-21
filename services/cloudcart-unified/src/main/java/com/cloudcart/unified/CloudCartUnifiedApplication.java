package com.cloudcart.unified;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.cloudcart")
@EnableFeignClients(basePackages = "com.cloudcart")
@EntityScan(basePackages = "com.cloudcart")
@EnableJpaRepositories(basePackages = "com.cloudcart")
public class CloudCartUnifiedApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudCartUnifiedApplication.class, args);
    }
}

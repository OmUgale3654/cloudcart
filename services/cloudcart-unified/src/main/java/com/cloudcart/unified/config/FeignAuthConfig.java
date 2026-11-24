
package com.cloudcart.unified.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignAuthConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return;
            }

            HttpServletRequest request = attributes.getRequest();

            String authorization = request.getHeader("Authorization");

            if (authorization != null && !authorization.isBlank()) {
                template.header("Authorization", authorization);
            }

            String userId = request.getHeader("X-User-Id");
            String userEmail = request.getHeader("X-User-Email");
            String userRoles = request.getHeader("X-User-Roles");

            if (userId != null) {
                template.header("X-User-Id", userId);
            }

            if (userEmail != null) {
                template.header("X-User-Email", userEmail);
            }

            if (userRoles != null) {
                template.header("X-User-Roles", userRoles);
            }
        };
    }
}

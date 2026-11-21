package com.cloudcart.gateway.filter;

import com.cloudcart.common.constant.SecurityConstants;
import com.cloudcart.gateway.util.JwtUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization header for path: {}", request.getURI().getPath());
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith(SecurityConstants.TOKEN_PREFIX)) {
                log.warn("Invalid Authorization header format for path: {}", request.getURI().getPath());
                return onError(exchange, "Invalid Authorization header format. Expected 'Bearer <token>'", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(SecurityConstants.TOKEN_PREFIX.length()).trim();

            if (!jwtUtil.validateToken(token)) {
                log.warn("Invalid or expired JWT token for path: {}", request.getURI().getPath());
                return onError(exchange, "Invalid or expired JWT token", HttpStatus.UNAUTHORIZED);
            }

            Long userId = jwtUtil.extractUserId(token);
            String username = jwtUtil.extractUsername(token);
            String roles = jwtUtil.extractRoles(token);

            ServerHttpRequest mutatedRequest = request.mutate()
                    .header(SecurityConstants.HEADER_USER_ID, userId != null ? String.valueOf(userId) : "")
                    .header(SecurityConstants.HEADER_USER_EMAIL, username != null ? username : "")
                    .header(SecurityConstants.HEADER_USER_ROLES, roles != null ? roles : "")
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> errorAttributes = new HashMap<>();
        errorAttributes.put("success", false);
        errorAttributes.put("status", httpStatus.value());
        errorAttributes.put("error", httpStatus.getReasonPhrase());
        errorAttributes.put("message", message);
        errorAttributes.put("path", exchange.getRequest().getURI().getPath());
        errorAttributes.put("timestamp", Instant.now().toString());

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorAttributes);
        } catch (JsonProcessingException e) {
            bytes = ("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
        // Configuration properties if needed
    }
}

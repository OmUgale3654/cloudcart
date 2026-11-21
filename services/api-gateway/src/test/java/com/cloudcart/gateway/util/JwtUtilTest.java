package com.cloudcart.gateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private JwtUtil jwtUtil;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET);
        key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    @DisplayName("Should validate valid JWT token and extract claims correctly")
    void shouldValidateValidToken() {
        String token = Jwts.builder()
                .subject("john.doe@example.com")
                .claim("userId", 1001L)
                .claim("role", "ROLE_CUSTOMER")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        assertTrue(jwtUtil.validateToken(token));
        assertEquals("john.doe@example.com", jwtUtil.extractUsername(token));
        assertEquals(1001L, jwtUtil.extractUserId(token));
        assertEquals("ROLE_CUSTOMER", jwtUtil.extractRoles(token));
    }

    @Test
    @DisplayName("Should return false for expired or malformed token")
    void shouldRejectInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.structure"));

        // Expired token
        String expiredToken = Jwts.builder()
                .subject("expired@example.com")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(key)
                .compact();

        assertFalse(jwtUtil.validateToken(expiredToken));
    }
}

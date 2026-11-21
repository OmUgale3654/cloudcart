package com.cloudcart.user.service;

import com.cloudcart.common.dto.auth.AuthRequest;
import com.cloudcart.common.dto.auth.AuthResponse;
import com.cloudcart.common.dto.auth.RegisterRequest;
import com.cloudcart.common.enums.Role;
import com.cloudcart.common.exception.ConflictException;
import com.cloudcart.common.exception.UnauthorizedException;
import com.cloudcart.user.entity.User;
import com.cloudcart.user.repository.UserRepository;
import com.cloudcart.user.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encoded_password")
                .firstName("Test")
                .lastName("User")
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new customer")
    void shouldRegisterNewUser() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@example.com")
                .password("Secret123!")
                .firstName("New")
                .lastName("User")
                .build();

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateToken(any(User.class))).thenReturn("mocked.jwt.token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when registering duplicate email")
    void shouldThrowConflictWhenEmailExists() {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("Secret123!")
                .firstName("Existing")
                .lastName("User")
                .build();

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void shouldLoginWithValidCredentials() {
        AuthRequest request = AuthRequest.builder()
                .email("test@example.com")
                .password("Password123")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123", "encoded_password")).thenReturn(true);
        when(tokenProvider.generateToken(sampleUser)).thenReturn("valid.jwt.token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Should throw UnauthorizedException on invalid password")
    void shouldRejectInvalidPassword() {
        AuthRequest request = AuthRequest.builder()
                .email("test@example.com")
                .password("WrongPassword")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "encoded_password")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}

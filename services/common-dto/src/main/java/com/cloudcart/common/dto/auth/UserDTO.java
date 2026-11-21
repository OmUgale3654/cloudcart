package com.cloudcart.common.dto.auth;

import com.cloudcart.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private String phone;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private boolean enabled;
    private Instant createdAt;
    private Instant updatedAt;
}

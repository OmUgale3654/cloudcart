package com.cloudcart.user.service;

import com.cloudcart.common.dto.auth.UserDTO;
import com.cloudcart.common.exception.ResourceNotFoundException;
import com.cloudcart.common.response.PageResponse;
import com.cloudcart.user.entity.User;
import com.cloudcart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToDTO(user);
    }

    @Transactional
    public UserDTO updateUserProfile(Long userId, UserDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName().trim());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName().trim());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getStreet() != null) user.setStreet(dto.getStreet());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getState() != null) user.setState(dto.getState());
        if (dto.getZipCode() != null) user.setZipCode(dto.getZipCode());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());

        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDTO> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        List<UserDTO> content = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return PageResponse.<UserDTO>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Transactional
    public UserDTO updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setEnabled(enabled);
        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    public UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .phone(user.getPhone())
                .street(user.getStreet())
                .city(user.getCity())
                .state(user.getState())
                .zipCode(user.getZipCode())
                .country(user.getCountry())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

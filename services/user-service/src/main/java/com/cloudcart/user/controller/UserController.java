package com.cloudcart.user.controller;

import com.cloudcart.common.constant.SecurityConstants;
import com.cloudcart.common.dto.auth.UserDTO;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.common.response.PageResponse;
import com.cloudcart.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and administration endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long headerUserId,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserDTO userDTO;
        if (headerUserId != null) {
            userDTO = userService.getUserById(headerUserId);
        } else if (userDetails != null) {
            userDTO = userService.getUserByEmail(userDetails.getUsername());
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Unable to identify authenticated user"));
        }

        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile and shipping address")
    public ResponseEntity<ApiResponse<UserDTO>> updateCurrentUser(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long headerUserId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDTO updateDTO) {

        Long userId = headerUserId;
        if (userId == null && userDetails != null) {
            userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        }

        if (userId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Unable to identify authenticated user"));
        }

        UserDTO updated = userService.updateUserProfile(userId, updateDTO);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID (Internal / Admin)")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Get paginated list of all users")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageResponse<UserDTO> result = userService.getAllUsers(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Enable or disable a user account")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        UserDTO updated = userService.updateUserStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.success("User status updated", updated));
    }
}

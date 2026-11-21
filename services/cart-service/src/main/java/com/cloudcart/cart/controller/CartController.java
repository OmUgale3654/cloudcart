package com.cloudcart.cart.controller;

import com.cloudcart.cart.service.CartService;
import com.cloudcart.common.constant.SecurityConstants;
import com.cloudcart.common.dto.cart.AddToCartRequest;
import com.cloudcart.common.dto.cart.CartDTO;
import com.cloudcart.common.dto.cart.UpdateCartItemRequest;
import com.cloudcart.common.exception.UnauthorizedException;
import com.cloudcart.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart item management and calculation APIs")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current authenticated user's shopping cart")
    public ResponseEntity<ApiResponse<CartDTO>> getCart(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long queryUserId) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        CartDTO cart = cartService.getCartByUserId(effectiveUserId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the shopping cart")
    public ResponseEntity<ApiResponse<CartDTO>> addItemToCart(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long queryUserId,
            @Valid @RequestBody AddToCartRequest request) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        CartDTO updatedCart = cartService.addItemToCart(effectiveUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", updatedCart));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<ApiResponse<CartDTO>> updateCartItemQuantity(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long queryUserId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        CartDTO updatedCart = cartService.updateCartItemQuantity(effectiveUserId, itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", updatedCart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from the cart")
    public ResponseEntity<ApiResponse<CartDTO>> removeItemFromCart(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long queryUserId,
            @PathVariable Long itemId) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        CartDTO updatedCart = cartService.removeItemFromCart(effectiveUserId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", updatedCart));
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear all items from the cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader(value = SecurityConstants.HEADER_USER_ID, required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long queryUserId) {

        Long effectiveUserId = resolveUserId(userId, queryUserId);
        cartService.clearCart(effectiveUserId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully"));
    }

    private Long resolveUserId(Long headerUserId, Long queryUserId) {
        if (headerUserId != null) return headerUserId;
        if (queryUserId != null) return queryUserId;
        throw new UnauthorizedException("User identification required to access shopping cart");
    }
}

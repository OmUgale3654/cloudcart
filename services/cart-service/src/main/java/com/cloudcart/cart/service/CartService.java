package com.cloudcart.cart.service;

import com.cloudcart.cart.client.InventoryClient;
import com.cloudcart.cart.client.ProductClient;
import com.cloudcart.cart.entity.Cart;
import com.cloudcart.cart.entity.CartItem;
import com.cloudcart.cart.repository.CartItemRepository;
import com.cloudcart.cart.repository.CartRepository;
import com.cloudcart.common.dto.cart.*;
import com.cloudcart.common.dto.inventory.InventoryDTO;
import com.cloudcart.common.dto.product.ProductDTO;
import com.cloudcart.common.exception.BadRequestException;
import com.cloudcart.common.exception.ResourceNotFoundException;
import com.cloudcart.common.exception.StockUnavailableException;
import com.cloudcart.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    @Transactional
    public CartDTO getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO addItemToCart(Long userId, AddToCartRequest request) {
        log.info("Adding product ID {} to cart for user {}", request.getProductId(), userId);

        // 1. Fetch live product info
        ApiResponse<ProductDTO> productResponse = productClient.getProductById(request.getProductId());
        if (productResponse == null || productResponse.getData() == null) {
            throw new ResourceNotFoundException("Product", "id", request.getProductId());
        }
        ProductDTO product = productResponse.getData();
        if (!product.isActive()) {
            throw new BadRequestException("Product '" + product.getName() + "' is currently unavailable for purchase.");
        }

        // 2. Check stock availability
        ApiResponse<InventoryDTO> stockResponse = inventoryClient.getStockBySku(product.getSku());
        if (stockResponse != null && stockResponse.getData() != null) {
            int available = stockResponse.getData().getAvailableQuantity();
            if (available < request.getQuantity()) {
                throw new StockUnavailableException(String.format(
                        "Cannot add %d items. Only %d units available for product '%s'.",
                        request.getQuantity(), available, product.getName()));
            }
        }

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existing = existingItemOpt.get();
            int updatedQuantity = existing.getQuantity() + request.getQuantity();
            existing.setQuantity(updatedQuantity);
            existing.setUnitPrice(product.getPrice());
            existing.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(updatedQuantity)));
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productId(product.getId())
                    .sku(product.getSku())
                    .productName(product.getName())
                    .imageUrl(product.getImageUrl())
                    .unitPrice(product.getPrice())
                    .quantity(request.getQuantity())
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())))
                    .build();
            cart.getItems().add(newItem);
        }

        Cart saved = cartRepository.save(cart);
        return mapToDTO(saved);
    }

    @Transactional
    public CartDTO updateCartItemQuantity(Long userId, Long itemId, int newQuantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (newQuantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(newQuantity);
            item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(newQuantity)));
        }

        Cart saved = cartRepository.save(cart);
        return mapToDTO(saved);
    }

    @Transactional
    public CartDTO removeItemFromCart(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        Cart saved = cartRepository.save(cart);
        return mapToDTO(saved);
    }

    @Transactional
    public void clearCart(Long userId) {
        log.info("Clearing shopping cart for user {}", userId);
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private CartDTO mapToDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> CartItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .sku(item.getSku())
                        .productName(item.getProductName())
                        .imageUrl(item.getImageUrl())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        BigDecimal totalAmount = cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(itemDTOs)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }
}

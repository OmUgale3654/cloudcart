package com.cloudcart.cart.service;

import com.cloudcart.cart.client.InventoryClient;
import com.cloudcart.cart.client.ProductClient;
import com.cloudcart.cart.entity.Cart;
import com.cloudcart.cart.entity.CartItem;
import com.cloudcart.cart.repository.CartItemRepository;
import com.cloudcart.cart.repository.CartRepository;
import com.cloudcart.common.dto.cart.AddToCartRequest;
import com.cloudcart.common.dto.cart.CartDTO;
import com.cloudcart.common.dto.inventory.InventoryDTO;
import com.cloudcart.common.dto.product.ProductDTO;
import com.cloudcart.common.exception.StockUnavailableException;
import com.cloudcart.common.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductClient productClient;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private CartService cartService;

    private Cart sampleCart;
    private ProductDTO sampleProduct;

    @BeforeEach
    void setUp() {
        sampleCart = Cart.builder()
                .id(1L)
                .userId(100L)
                .items(new ArrayList<>())
                .build();

        sampleProduct = ProductDTO.builder()
                .id(10L)
                .sku("PROD-KEYBOARD-01")
                .name("Mechanical Keyboard")
                .price(new BigDecimal("129.99"))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should fetch existing cart and compute totals correctly")
    void shouldGetCartForUser() {
        CartItem item = CartItem.builder()
                .id(5L)
                .cart(sampleCart)
                .productId(10L)
                .sku("PROD-KEYBOARD-01")
                .productName("Mechanical Keyboard")
                .unitPrice(new BigDecimal("129.99"))
                .quantity(2)
                .subtotal(new BigDecimal("259.98"))
                .build();
        sampleCart.getItems().add(item);

        when(cartRepository.findByUserId(100L)).thenReturn(Optional.of(sampleCart));

        CartDTO cartDTO = cartService.getCartByUserId(100L);

        assertNotNull(cartDTO);
        assertEquals(1, cartDTO.getItems().size());
        assertEquals(2, cartDTO.getTotalItems());
        assertEquals(new BigDecimal("259.98"), cartDTO.getTotalAmount());
    }

    @Test
    @DisplayName("Should successfully add item to cart when stock is available")
    void shouldAddItemToCart() {
        AddToCartRequest request = AddToCartRequest.builder()
                .productId(10L)
                .quantity(1)
                .build();

        when(productClient.getProductById(10L)).thenReturn(ApiResponse.success(sampleProduct));
        when(inventoryClient.getStockBySku("PROD-KEYBOARD-01"))
                .thenReturn(ApiResponse.success(InventoryDTO.builder().availableQuantity(25).build()));
        when(cartRepository.findByUserId(100L)).thenReturn(Optional.of(sampleCart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArguments()[0]);

        CartDTO result = cartService.addItemToCart(100L, request);

        assertNotNull(result);
        assertEquals(1, result.getItems().size());
        assertEquals(new BigDecimal("129.99"), result.getTotalAmount());
    }

    @Test
    @DisplayName("Should throw StockUnavailableException when quantity exceeds available stock")
    void shouldRejectWhenStockInsufficient() {
        AddToCartRequest request = AddToCartRequest.builder()
                .productId(10L)
                .quantity(5)
                .build();

        when(productClient.getProductById(10L)).thenReturn(ApiResponse.success(sampleProduct));
        when(inventoryClient.getStockBySku("PROD-KEYBOARD-01"))
                .thenReturn(ApiResponse.success(InventoryDTO.builder().availableQuantity(2).build()));

        assertThrows(StockUnavailableException.class, () -> cartService.addItemToCart(100L, request));
    }

    @Test
    @DisplayName("Should clear all items from user cart")
    void shouldClearCart() {
        sampleCart.getItems().add(CartItem.builder().id(1L).build());
        when(cartRepository.findByUserId(100L)).thenReturn(Optional.of(sampleCart));

        cartService.clearCart(100L);

        assertTrue(sampleCart.getItems().isEmpty());
        verify(cartRepository, times(1)).save(sampleCart);
    }
}

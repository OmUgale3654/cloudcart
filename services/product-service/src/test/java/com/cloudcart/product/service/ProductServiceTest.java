package com.cloudcart.product.service;

import com.cloudcart.common.dto.inventory.InventoryDTO;
import com.cloudcart.common.dto.product.ProductDTO;
import com.cloudcart.common.exception.ConflictException;
import com.cloudcart.common.exception.ResourceNotFoundException;
import com.cloudcart.common.response.ApiResponse;
import com.cloudcart.common.response.PageResponse;
import com.cloudcart.product.client.InventoryClient;
import com.cloudcart.product.entity.Category;
import com.cloudcart.product.entity.Product;
import com.cloudcart.product.repository.CategoryRepository;
import com.cloudcart.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private ProductService productService;

    private Category sampleCategory;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L)
                .name("Audio")
                .description("Sound devices")
                .build();

        sampleProduct = Product.builder()
                .id(10L)
                .sku("PROD-TEST-HEADPHONE")
                .name("Test Headphones")
                .description("Wireless ANC")
                .price(new BigDecimal("199.99"))
                .category(sampleCategory)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully search products and return paged response")
    void shouldSearchProducts() {
        Page<Product> productPage = new PageImpl<>(Collections.singletonList(sampleProduct));
        Pageable pageable = PageRequest.of(0, 10);

        when(productRepository.searchProducts(null, null, null, null, true, pageable))
                .thenReturn(productPage);

        PageResponse<ProductDTO> response = productService.searchProducts(null, null, null, null, true, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("PROD-TEST-HEADPHONE", response.getContent().get(0).getSku());
    }

    @Test
    @DisplayName("Should fetch product by ID and enrich available stock from Inventory Client")
    void shouldGetProductByIdWithStock() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));

        InventoryDTO stockDTO = InventoryDTO.builder()
                .sku("PROD-TEST-HEADPHONE")
                .availableQuantity(45)
                .build();
        when(inventoryClient.getStockBySku("PROD-TEST-HEADPHONE"))
                .thenReturn(ApiResponse.success(stockDTO));

        ProductDTO result = productService.getProductById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals(45, result.getStockQuantity());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void shouldThrowNotFoundWhenProductMissing() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    @DisplayName("Should create product when SKU is unique")
    void shouldCreateProduct() {
        ProductDTO createDTO = ProductDTO.builder()
                .sku("PROD-NEW-01")
                .name("New Device")
                .price(new BigDecimal("99.99"))
                .categoryId(1L)
                .active(true)
                .build();

        when(productRepository.existsBySku("PROD-NEW-01")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductDTO created = productService.createProduct(createDTO);

        assertNotNull(created);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when creating product with existing SKU")
    void shouldThrowConflictWhenSkuExists() {
        ProductDTO createDTO = ProductDTO.builder()
                .sku("PROD-TEST-HEADPHONE")
                .name("Duplicate SKU Device")
                .price(new BigDecimal("99.99"))
                .build();

        when(productRepository.existsBySku("PROD-TEST-HEADPHONE")).thenReturn(true);

        assertThrows(ConflictException.class, () -> productService.createProduct(createDTO));
        verify(productRepository, never()).save(any(Product.class));
    }
}

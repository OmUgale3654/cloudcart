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
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryClient inventoryClient;

    @Transactional(readOnly = true)
    public PageResponse<ProductDTO> searchProducts(
            String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Boolean active, Pageable pageable) {

        Page<Product> page = productRepository.searchProducts(keyword, categoryId, minPrice, maxPrice, active, pageable);
        List<ProductDTO> content = page.getContent().stream()
                .map(p -> mapToDTO(p, false))
                .toList();

        return PageResponse.<ProductDTO>builder()
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

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product, true);
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return mapToDTO(product, true);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new ConflictException("Product with SKU '" + dto.getSku() + "' already exists");
        }

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
        }

        Product product = Product.builder()
                .sku(dto.getSku().trim().toUpperCase())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(category)
                .imageUrl(dto.getImageUrl())
                .active(dto.isActive())
                .build();

        Product saved = productRepository.save(product);
        log.info("Created new product with ID: {}, SKU: {}", saved.getId(), saved.getSku());
        return mapToDTO(saved, false);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (dto.getName() != null) product.setName(dto.getName().trim());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());
        product.setActive(dto.isActive());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
            product.setCategory(category);
        }

        Product updated = productRepository.save(product);
        return mapToDTO(updated, true);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(false);
        productRepository.save(product);
        log.info("Soft deleted/deactivated product with ID: {}", id);
    }

    public ProductDTO mapToDTO(Product product, boolean fetchStock) {
        Integer stockQuantity = null;

        if (fetchStock) {
            try {
                ApiResponse<InventoryDTO> stockResponse = inventoryClient.getStockBySku(product.getSku());
                if (stockResponse != null && stockResponse.getData() != null) {
                    stockQuantity = stockResponse.getData().getAvailableQuantity();
                }
            } catch (Exception e) {
                log.warn("Failed to retrieve real-time stock for SKU {}: {}", product.getSku(), e.getMessage());
            }
        }

        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .stockQuantity(stockQuantity)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}

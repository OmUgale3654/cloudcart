package com.cloudcart.product.service;

import com.cloudcart.common.dto.product.CategoryDTO;
import com.cloudcart.common.exception.ConflictException;
import com.cloudcart.common.exception.ResourceNotFoundException;
import com.cloudcart.product.entity.Category;
import com.cloudcart.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new ConflictException("Category with name '" + dto.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .build();

        Category saved = categoryRepository.save(category);
        return mapToDTO(saved);
    }

    public CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .build();
    }
}

package com.cloudcart.common.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDTO {
    private Long id;

    @NotBlank(message = "SKU is required")
    private String sku;

    @Min(value = 0, message = "Available quantity cannot be negative")
    private int availableQuantity;

    private int reservedQuantity;
    private Instant updatedAt;
}

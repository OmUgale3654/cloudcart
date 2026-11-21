package com.cloudcart.common.dto.order;

import com.cloudcart.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private OrderStatus status;

    @Builder.Default
    private List<OrderItemDTO> items = new ArrayList<>();

    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;

    private String shippingAddress;
    private String paymentTransactionId;
    private Instant createdAt;
    private Instant updatedAt;
}

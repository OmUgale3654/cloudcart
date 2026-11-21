package com.cloudcart.inventory.service;

import com.cloudcart.common.dto.inventory.*;
import com.cloudcart.common.exception.ResourceNotFoundException;
import com.cloudcart.common.exception.StockUnavailableException;
import com.cloudcart.inventory.entity.Inventory;
import com.cloudcart.inventory.entity.InventoryReservation;
import com.cloudcart.inventory.entity.InventoryReservationItem;
import com.cloudcart.inventory.repository.InventoryRepository;
import com.cloudcart.inventory.repository.InventoryReservationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public InventoryDTO getStockBySku(String sku) {
        Inventory inventory = inventoryRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "sku", sku));

        return mapToDTO(inventory);
    }

    @Transactional
    public StockReservationResponse reserveStock(StockReservationRequest request) {
        log.info("Processing stock reservation for order: {}", request.getOrderNumber());

        List<InventoryReservationItem> reservationItems = new ArrayList<>();
        String reservationId = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        for (OrderItemReservation item : request.getItems()) {
            Inventory inventory = inventoryRepository.findBySkuForUpdate(item.getSku())
                    .orElseThrow(() -> new StockUnavailableException("Item with SKU '" + item.getSku() + "' is not available in inventory"));

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                log.warn("Insufficient stock for SKU: {}. Requested: {}, Available: {}",
                        item.getSku(), item.getQuantity(), inventory.getAvailableQuantity());
                throw new StockUnavailableException(String.format(
                        "Insufficient stock for SKU '%s'. Requested: %d, Available: %d",
                        item.getSku(), item.getQuantity(), inventory.getAvailableQuantity()));
            }

            // Deduct available, add to reserved
            inventory.setAvailableQuantity(inventory.getAvailableQuantity() - item.getQuantity());
            inventory.setReservedQuantity(inventory.getReservedQuantity() + item.getQuantity());
            inventoryRepository.save(inventory);

            reservationItems.add(InventoryReservationItem.builder()
                    .reservationId(reservationId)
                    .sku(item.getSku())
                    .quantity(item.getQuantity())
                    .build());
        }

        InventoryReservation reservation = InventoryReservation.builder()
                .reservationId(reservationId)
                .orderNumber(request.getOrderNumber())
                .status("RESERVED")
                .items(reservationItems)
                .build();

        reservationRepository.save(reservation);
        log.info("Stock reserved successfully. Reservation ID: {}, Order: {}", reservationId, request.getOrderNumber());

        return StockReservationResponse.builder()
                .reservationId(reservationId)
                .orderNumber(request.getOrderNumber())
                .reserved(true)
                .message("Stock reserved successfully")
                .build();
    }

    @Transactional
    public void confirmReservation(String reservationId) {
        log.info("Confirming stock deduction for reservation: {}", reservationId);

        InventoryReservation reservation = reservationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if ("CONFIRMED".equalsIgnoreCase(reservation.getStatus())) {
            log.info("Reservation {} already confirmed", reservationId);
            return;
        }

        for (InventoryReservationItem item : reservation.getItems()) {
            Inventory inventory = inventoryRepository.findBySkuForUpdate(item.getSku())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory", "sku", item.getSku()));

            inventory.setReservedQuantity(Math.max(0, inventory.getReservedQuantity() - item.getQuantity()));
            inventoryRepository.save(inventory);
        }

        reservation.setStatus("CONFIRMED");
        reservationRepository.save(reservation);
        log.info("Reservation {} confirmed and stock deducted permanently", reservationId);
    }

    @Transactional
    public void releaseReservation(String reservationId) {
        log.info("Compensating action: Releasing reserved stock for reservation: {}", reservationId);

        InventoryReservation reservation = reservationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if ("RELEASED".equalsIgnoreCase(reservation.getStatus())) {
            log.info("Reservation {} already released", reservationId);
            return;
        }

        for (InventoryReservationItem item : reservation.getItems()) {
            Inventory inventory = inventoryRepository.findBySkuForUpdate(item.getSku())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory", "sku", item.getSku()));

            inventory.setReservedQuantity(Math.max(0, inventory.getReservedQuantity() - item.getQuantity()));
            inventory.setAvailableQuantity(inventory.getAvailableQuantity() + item.getQuantity());
            inventoryRepository.save(inventory);
        }

        reservation.setStatus("RELEASED");
        reservationRepository.save(reservation);
        log.info("Reservation {} released. Stock restored to available pool.", reservationId);
    }

    @Transactional
    public InventoryDTO updateStock(String sku, int newQuantity) {
        Inventory inventory = inventoryRepository.findBySkuForUpdate(sku)
                .orElseGet(() -> Inventory.builder()
                        .sku(sku)
                        .availableQuantity(0)
                        .reservedQuantity(0)
                        .build());

        inventory.setAvailableQuantity(newQuantity);
        Inventory saved = inventoryRepository.save(inventory);
        return mapToDTO(saved);
    }

    private InventoryDTO mapToDTO(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .sku(inventory.getSku())
                .availableQuantity(inventory.getAvailableQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}

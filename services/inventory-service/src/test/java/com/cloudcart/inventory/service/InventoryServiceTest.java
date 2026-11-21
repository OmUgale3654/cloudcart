package com.cloudcart.inventory.service;

import com.cloudcart.common.dto.inventory.OrderItemReservation;
import com.cloudcart.common.dto.inventory.StockReservationRequest;
import com.cloudcart.common.dto.inventory.StockReservationResponse;
import com.cloudcart.common.exception.StockUnavailableException;
import com.cloudcart.inventory.entity.Inventory;
import com.cloudcart.inventory.entity.InventoryReservation;
import com.cloudcart.inventory.entity.InventoryReservationItem;
import com.cloudcart.inventory.repository.InventoryRepository;
import com.cloudcart.inventory.repository.InventoryReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryReservationRepository reservationRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Inventory sampleInventory;

    @BeforeEach
    void setUp() {
        sampleInventory = Inventory.builder()
                .id(1L)
                .sku("PROD-TEST-01")
                .availableQuantity(50)
                .reservedQuantity(5)
                .build();
    }

    @Test
    @DisplayName("Should successfully reserve stock when sufficient quantity is available")
    void shouldReserveStockSuccessfully() {
        StockReservationRequest request = StockReservationRequest.builder()
                .orderNumber("ORD-1001")
                .items(Collections.singletonList(
                        OrderItemReservation.builder().sku("PROD-TEST-01").quantity(10).build()))
                .build();

        when(inventoryRepository.findBySkuForUpdate("PROD-TEST-01")).thenReturn(Optional.of(sampleInventory));
        when(reservationRepository.save(any(InventoryReservation.class))).thenAnswer(i -> i.getArguments()[0]);

        StockReservationResponse response = inventoryService.reserveStock(request);

        assertNotNull(response);
        assertTrue(response.isReserved());
        assertEquals("ORD-1001", response.getOrderNumber());
        assertEquals(40, sampleInventory.getAvailableQuantity());
        assertEquals(15, sampleInventory.getReservedQuantity());
        verify(inventoryRepository, times(1)).save(sampleInventory);
    }

    @Test
    @DisplayName("Should throw StockUnavailableException when requested quantity exceeds available stock")
    void shouldRejectReservationWhenInsufficientStock() {
        StockReservationRequest request = StockReservationRequest.builder()
                .orderNumber("ORD-1002")
                .items(Collections.singletonList(
                        OrderItemReservation.builder().sku("PROD-TEST-01").quantity(100).build()))
                .build();

        when(inventoryRepository.findBySkuForUpdate("PROD-TEST-01")).thenReturn(Optional.of(sampleInventory));

        assertThrows(StockUnavailableException.class, () -> inventoryService.reserveStock(request));
        assertEquals(50, sampleInventory.getAvailableQuantity());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should confirm reservation and deduct reserved stock permanently")
    void shouldConfirmReservation() {
        InventoryReservationItem item = InventoryReservationItem.builder()
                .reservationId("RES-12345")
                .sku("PROD-TEST-01")
                .quantity(10)
                .build();

        InventoryReservation reservation = InventoryReservation.builder()
                .reservationId("RES-12345")
                .orderNumber("ORD-1003")
                .status("RESERVED")
                .items(List.of(item))
                .build();

        when(reservationRepository.findByReservationId("RES-12345")).thenReturn(Optional.of(reservation));
        when(inventoryRepository.findBySkuForUpdate("PROD-TEST-01")).thenReturn(Optional.of(sampleInventory));

        inventoryService.confirmReservation("RES-12345");

        assertEquals("CONFIRMED", reservation.getStatus());
        assertEquals(0, sampleInventory.getReservedQuantity());
        verify(reservationRepository, times(1)).save(reservation);
    }

    @Test
    @DisplayName("Should release reservation and restore stock to available pool")
    void shouldReleaseReservation() {
        InventoryReservationItem item = InventoryReservationItem.builder()
                .reservationId("RES-99999")
                .sku("PROD-TEST-01")
                .quantity(5)
                .build();

        InventoryReservation reservation = InventoryReservation.builder()
                .reservationId("RES-99999")
                .orderNumber("ORD-1004")
                .status("RESERVED")
                .items(List.of(item))
                .build();

        when(reservationRepository.findByReservationId("RES-99999")).thenReturn(Optional.of(reservation));
        when(inventoryRepository.findBySkuForUpdate("PROD-TEST-01")).thenReturn(Optional.of(sampleInventory));

        inventoryService.releaseReservation("RES-99999");

        assertEquals("RELEASED", reservation.getStatus());
        assertEquals(0, sampleInventory.getReservedQuantity());
        assertEquals(55, sampleInventory.getAvailableQuantity());
        verify(reservationRepository, times(1)).save(reservation);
    }
}

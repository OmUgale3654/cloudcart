package com.cloudcart.inventory.repository;

import com.cloudcart.inventory.entity.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {

    Optional<InventoryReservation> findByReservationId(String reservationId);

    Optional<InventoryReservation> findByOrderNumber(String orderNumber);
}

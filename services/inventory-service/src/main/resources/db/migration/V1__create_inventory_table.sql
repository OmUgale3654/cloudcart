-- CloudCart Inventory Service Schema
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);

CREATE TABLE IF NOT EXISTS inventory_reservations (
    id BIGSERIAL PRIMARY KEY,
    reservation_id VARCHAR(64) NOT NULL UNIQUE,
    order_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RESERVED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_res_id ON inventory_reservations(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservations_order_no ON inventory_reservations(order_number);

CREATE TABLE IF NOT EXISTS inventory_reservation_items (
    id BIGSERIAL PRIMARY KEY,
    reservation_id VARCHAR(64) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    quantity INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_res_items_res_id ON inventory_reservation_items(reservation_id);

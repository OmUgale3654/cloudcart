-- Seed Initial Admin and Customer
-- Admin credentials: admin@cloudcart.com / Admin123!
-- Customer credentials: customer@cloudcart.com / Customer123!
-- Alternative credentials:
-- admin@cloudcart.internal / admin123
-- customer@example.com / password123

INSERT INTO users (email, password, first_name, last_name, role, phone, street, city, state, zip_code, country, enabled, created_at, updated_at)
VALUES 
(
    'admin@cloudcart.com',
    '$2a$10$2EcTgXtAfXpCwayeZi1sq.8m9ZFlZrTuOx3UpNnRb/MS1uvc1CR5C',
    'System',
    'Admin',
    'ROLE_ADMIN',
    '+91 98765 43210',
    '100 Tech Park, Whitefield',
    'Bengaluru',
    'Karnataka',
    '560066',
    'India',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO users (email, password, first_name, last_name, role, phone, street, city, state, zip_code, country, enabled, created_at, updated_at)
VALUES 
(
    'customer@cloudcart.com',
    '$2a$10$zFrnLPUL3N1u6Zfc/h8KOOWOMUdmXHSCbcDf/b4YaVhD/pIx6WDUi',
    'Aarav',
    'Patel',
    'ROLE_CUSTOMER',
    '+91 98765 12345',
    '42 Brigade Road',
    'Bengaluru',
    'Karnataka',
    '560025',
    'India',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO users (email, password, first_name, last_name, role, phone, street, city, state, zip_code, country, enabled, created_at, updated_at)
VALUES 
(
    'admin@cloudcart.internal',
    '$2a$10$F2T/wbB83ZpVhAwZsSzm6uBtVbwFf6zQ2ttmWGXBLSWnbHGEEznri',
    'CloudCart',
    'Admin',
    'ROLE_ADMIN',
    '+91 98111 22334',
    'Tower B, Cyber City',
    'Gurugram',
    'Haryana',
    '122002',
    'India',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO users (email, password, first_name, last_name, role, phone, street, city, state, zip_code, country, enabled, created_at, updated_at)
VALUES 
(
    'customer@example.com',
    '$2a$10$OpJfT1yptdyFvGC4wBtt9uFdCN4DdAVT/ygzIfDiewfpTNylooO1W',
    'Priya',
    'Sharma',
    'ROLE_CUSTOMER',
    '+91 98222 33445',
    '12 Marine Drive',
    'Mumbai',
    'Maharashtra',
    '400020',
    'India',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

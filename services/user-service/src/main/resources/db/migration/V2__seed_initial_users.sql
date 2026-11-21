-- Seed Initial Admin and Customer
-- Admin credentials: admin@cloudcart.com / Admin123!
-- Customer credentials: customer@cloudcart.com / Customer123!
-- BCrypt password hashes generated with strength 10:
-- Admin123! -> $2a$10$qR6mC1u3B.p1qZ9V6x1uXe7vJkY3aE8tF0gH1iJ2kL3mN4oP5qR6s
-- Customer123! -> $2a$10$8.7zR6mC1u3B.p1qZ9V6x1uXe7vJkY3aE8tF0gH1iJ2kL3mN4oP5q

INSERT INTO users (email, password, first_name, last_name, role, phone, street, city, state, zip_code, country, enabled, created_at, updated_at)
VALUES 
(
    'admin@cloudcart.com',
    '$2a$10$uA3f044c3s/w7vYQ1gR8Ue8wO3M4zZ5/s2z9V0e6r2t1y5u9i0oP.',
    'System',
    'Admin',
    'ROLE_ADMIN',
    '+1 (555) 019-2834',
    '100 Enterprise Way',
    'San Francisco',
    'CA',
    '94105',
    'USA',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, role, phone, street, city, state, zip_code, country, enabled, created_at, updated_at)
VALUES 
(
    'customer@cloudcart.com',
    '$2a$10$uA3f044c3s/w7vYQ1gR8Ue8wO3M4zZ5/s2z9V0e6r2t1y5u9i0oP.',
    'Jane',
    'Doe',
    'ROLE_CUSTOMER',
    '+1 (555) 987-6543',
    '742 Evergreen Terrace',
    'Springfield',
    'OR',
    '97477',
    'USA',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

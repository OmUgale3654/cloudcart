-- Seed Initial Product Categories
INSERT INTO categories (id, name, description, image_url)
VALUES 
    (1, 'Audio & Sound', 'Premium wireless headphones, earbuds and portable speakers', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
    (2, 'Wearables', 'Advanced fitness trackers, smartwatches and biometric bands', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
    (3, 'Computer Accessories', 'High performance mechanical keyboards, mice and docking hubs', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'),
    (4, 'Power & Cables', 'GaN high speed chargers, braided cords and wireless pads', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500')
ON CONFLICT (name) DO NOTHING;

-- Seed Initial Products
INSERT INTO products (sku, name, description, price, category_id, image_url, active)
VALUES 
    ('PROD-HEADPHONE-01', 'CloudSound Pro Active Noise-Cancelling Headphones', 'Over-ear Bluetooth headphones with active noise cancellation, 40-hour battery life, and hi-res acoustic drivers.', 249.99, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', TRUE),
    ('PROD-SMARTWATCH-01', 'AeroTrack GPS Smartwatch', 'Rugged outdoor smartwatch with optical heart rate monitor, multi-band GPS, and 14-day battery life.', 199.50, 2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', TRUE),
    ('PROD-KEYBOARD-01', 'HyperClick Mechanical Gaming Keyboard', 'Compact 75% mechanical keyboard with hot-swappable linear switches, RGB backlighting, and aluminum chassis.', 129.99, 3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', TRUE),
    ('PROD-CHARGER-01', 'VoltMax 65W GaN Dual-Port Fast Charger', 'Ultra-compact gallium nitride wall charger with USB-C Power Delivery and smart power distribution.', 39.99, 4, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500', TRUE),
    ('PROD-MOUSE-01', 'ErgoGlide Wireless Productivity Mouse', 'Ergonomic sculptured mouse with silent switches, dual Bluetooth/2.4G wireless, and hyper-scroll wheel.', 59.99, 3, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', TRUE),
    ('PROD-SPEAKER-01', 'WavePulse IPX7 Waterproof Bluetooth Speaker', 'Compact wireless cylinder speaker with 360-degree sound, punchy bass, and 20 hours playtime.', 79.95, 1, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', TRUE),
    ('PROD-BACKPACK-01', 'UrbanShield Weatherproof Tech Backpack', 'Sleek 22L laptop backpack with padded compartment, luggage pass-through, and waterproof ballistic nylon.', 89.00, 3, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', TRUE),
    ('PROD-HUB-01', 'MultiPort 7-in-1 USB-C Aluminum Dock', 'Versatile adapter with 4K HDMI, 100W PD passthrough, SD/microSD reader, and 3x USB 3.0 ports.', 49.99, 4, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500', TRUE)
ON CONFLICT (sku) DO NOTHING;

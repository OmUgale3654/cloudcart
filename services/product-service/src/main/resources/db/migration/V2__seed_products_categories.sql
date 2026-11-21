-- Seed Initial Product Categories
INSERT INTO categories (id, name, description, image_url)
VALUES 
    (1, 'Audio & Sound', 'Premium wireless headphones, earbuds and portable speakers', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
    (2, 'Wearables & Smartwatches', 'Advanced fitness trackers, smartwatches and biometric bands', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
    (3, 'Computer & Gaming Gear', 'High performance mechanical keyboards, mice and docking hubs', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'),
    (4, 'Mobile & Power Accessories', 'GaN high speed chargers, braided cords and wireless pads', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500'),
    (5, 'Smart Home & IoT', 'Security cameras, ambient smart lighting and WiFi automation', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500'),
    (6, 'Photography & Creator Gear', 'Studio condenser microphones, ring lights and smartphone gimbals', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'),
    (7, 'Travel & Tech Bags', 'Weatherproof laptop backpacks, EDC slings and tech organizers', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500')
ON CONFLICT (name) DO NOTHING;

-- Seed Initial Products (Prices in INR)
INSERT INTO products (sku, name, description, price, category_id, image_url, active)
VALUES 
    -- Category 1: Audio & Sound
    ('PROD-HEADPHONE-01', 'CloudSound Pro Active Noise-Cancelling Headphones', 'Over-ear Bluetooth headphones with hybrid active noise cancellation, 40-hour battery life, and hi-res acoustic drivers.', 14999.00, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', TRUE),
    ('PROD-SPEAKER-01', 'WavePulse IPX7 Waterproof Bluetooth Speaker', 'Compact wireless cylinder speaker with 360-degree sound, punchy bass, and 20 hours playtime.', 3499.00, 1, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', TRUE),
    ('PROD-EARBUDS-01', 'SonicBeats Pro True Wireless Earbuds with ANC', 'Bluetooth 5.3 earbuds featuring 35dB active noise cancelling, quad-mic ENC for crystal-clear calls, and IPX5 sweat resistance.', 4999.00, 1, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', TRUE),
    ('PROD-EARBUDS-02', 'BassBoost Wireless Neckband Earphones', 'Flexible magnetic neckband with dynamic 12mm drivers, fast charge (10 mins for 10 hours), and dual pairing.', 1499.00, 1, 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=500', TRUE),
    ('PROD-SOUNDBAR-01', 'CinemaSurround 120W Dolby Atmos Soundbar', 'Immersive home theater soundbar with wireless subwoofer, HDMI eARC, optical input, and dedicated equalizer modes.', 11999.00, 1, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500', TRUE),
    ('PROD-SPEAKER-02', 'BoomBox Party Bluetooth Speaker 60W with RGB', 'High-output portable party speaker with deep bass radiator, dynamic strobe lights, and built-in mic input for karaoke.', 6499.00, 1, 'https://images.unsplash.com/photo-1529359744902-86b2ab9ed2e1?w=500', TRUE),
    ('PROD-HEADSET-01', 'HyperAcoustic Studio Monitoring Wired Headphones', 'Closed-back over-ear reference monitor headphones with 50mm neodymium drivers and detachable coiled cable.', 7999.00, 1, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', TRUE),
    ('PROD-EARBUDS-03', 'AeroBuds Ultra Lightweight Sport Earphones', 'Secure ergonomic ear-hook wireless buds designed for intense marathons and gym workouts with IPX8 waterproof rating.', 2299.00, 1, 'https://images.unsplash.com/photo-1631867675167-90a456a90863?w=500', TRUE),

    -- Category 2: Wearables & Smartwatches
    ('PROD-SMARTWATCH-01', 'AeroTrack GPS Smartwatch', 'Rugged outdoor smartwatch with optical heart rate monitor, multi-band GPS, and 14-day battery life.', 6999.00, 2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', TRUE),
    ('PROD-SMARTWATCH-02', 'PulseFit AMOLED Display Smartwatch with BT Calling', '1.96-inch curved AMOLED touch display with AI voice assistant, Bluetooth calling, and 100+ sports modes.', 3999.00, 2, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500', TRUE),
    ('PROD-FITBAND-01', 'VitalTrack 24/7 Heart & SpO2 Fitness Band', 'Slim water-resistant activity tracker with continuous pulse ox monitoring, sleep stage tracking, and 20-day standby.', 1999.00, 2, 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500', TRUE),
    ('PROD-SMARTWATCH-03', 'ApexPro Titanium Rugged Outdoor Smartwatch', 'Military-grade titanium alloy smartwatch with sapphire crystal glass, barometric altimeter, and offline topographic maps.', 16999.00, 2, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', TRUE),
    ('PROD-SMARTWATCH-04', 'Elegance Slim Luxury Metal Mesh Smartwatch', 'Rose gold and stainless steel smart timepiece designed for professional style with custom watch faces and stress alerts.', 8499.00, 2, 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=500', TRUE),
    ('PROD-SMARTBAND-01', 'SleepSync Smart Health Tracker Ring', 'Titanium smart ring measuring body temperature variations, HRV, deep sleep latency, and daytime recovery.', 12499.00, 2, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', TRUE),
    ('PROD-FITBAND-02', 'SprintStep Ultra Swimming & Running Tracker', '50-meter water-resistant fitness bracelet with automatic stroke detection and VO2 max stamina estimation.', 2799.00, 2, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500', TRUE),
    ('PROD-SMARTWATCH-05', 'JuniorSafe GPS Kid Watch with Realtime SOS', 'Kids smartwatch with 4G video calling, geofencing safe zones, and instant parent emergency panic button.', 4499.00, 2, 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500', TRUE),

    -- Category 3: Computer & Gaming Gear
    ('PROD-KEYBOARD-01', 'HyperClick Mechanical Gaming Keyboard', 'Compact 75% mechanical keyboard with hot-swappable linear switches, RGB backlighting, and aluminum chassis.', 4499.00, 3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', TRUE),
    ('PROD-MOUSE-01', 'ErgoGlide Wireless Productivity Mouse', 'Ergonomic sculptured mouse with silent switches, dual Bluetooth/2.4G wireless, and hyper-scroll wheel.', 2199.00, 3, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', TRUE),
    ('PROD-KEYBOARD-02', 'ProType Wireless Multi-Device Quiet Keyboard', 'Low-profile wireless membrane keyboard with seamless Bluetooth switching across 3 devices (Mac/Windows/iPad).', 3299.00, 3, 'https://images.unsplash.com/photo-1560762484-813fc97650a0?w=500', TRUE),
    ('PROD-MOUSE-02', 'ViperStrike 16,000 DPI Optical Gaming Mouse', 'Ultralight 62-gram honeycomb shell esport mouse with paracord cable and 100% virgin PTFE skates.', 2999.00, 3, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', TRUE),
    ('PROD-DESKPAD-01', 'UltraSmooth XXL Extended Microfiber Mousepad', '900x400mm waterproof gaming desk mat with precision tracking surface and anti-fray stitched edges.', 999.00, 3, 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500', TRUE),
    ('PROD-MONITOR-01', 'ClearView 27-inch 4K UHD IPS Designer Monitor', 'Factory-calibrated 99% sRGB color gamut display with HDR400, 65W USB-C single cable power delivery, and tilt stand.', 27999.00, 3, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', TRUE),
    ('PROD-STAND-01', 'ErgoRise Aluminum Adjustable Laptop Stand', 'Foldable CNC anodized aluminum riser promoting neutral neck posture with cooling ventilation slots.', 1799.00, 3, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', TRUE),
    ('PROD-KEYBOARD-03', 'RetroType Vintage Mechanical Typewriter Keyboard', 'Round vintage keycaps with clicky blue switches, dual mode wireless, and metallic chrome rim details.', 5499.00, 3, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', TRUE),
    ('PROD-CHAIR-01', 'CloudComfort Ergonomic Mesh High-Back Office Chair', 'Breathable Korean mesh desk chair with dynamic lumbar support, 3D armrests, and synchro-tilt mechanism.', 14499.00, 3, 'https://images.unsplash.com/photo-1580481077195-c328a37db729?w=500', TRUE),
    ('PROD-MOUSE-03', 'AeroTrack Vertical Ergonomic Carpal-Tunnel Mouse', 'Natural 57-degree handshake grip mouse designed by ergonomists to relieve forearm strain and tendon fatigue.', 2499.00, 3, 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500', TRUE),

    -- Category 4: Mobile & Power Accessories
    ('PROD-CHARGER-01', 'VoltMax 65W GaN Dual-Port Fast Charger', 'Ultra-compact gallium nitride wall charger with USB-C Power Delivery and smart power distribution.', 2199.00, 4, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500', TRUE),
    ('PROD-HUB-01', 'MultiPort 7-in-1 USB-C Aluminum Dock', 'Versatile adapter with 4K HDMI, 100W PD passthrough, SD/microSD reader, and 3x USB 3.0 ports.', 3499.00, 4, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500', TRUE),
    ('PROD-POWERBANK-01', 'PowerVault 20,000mAh 45W PD Fast Power Bank', 'High-density airline-safe power reservoir capable of recharging laptops, tablets, and smartphones simultaneously.', 2899.00, 4, 'https://images.unsplash.com/photo-1609592807665-2244f77c8e6a?w=500', TRUE),
    ('PROD-POWERBANK-02', 'MagSafe Slim 10,000mAh Magnetic Wireless Power Bank', 'Snap-on wireless magnetic battery pack with foldout kickstand for convenient movie watching during charging.', 3199.00, 4, 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=500', TRUE),
    ('PROD-CHARGER-02', 'TrioDock 3-in-1 Fast Wireless Charging Station', 'Compact bedside stand powering your phone (15W), smartwatch (5W), and wireless earbuds (5W) concurrently.', 3999.00, 4, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500', TRUE),
    ('PROD-CABLE-01', 'ArmorCord 100W Braided USB-C Cable (2m)', 'Heavy-duty Kevlar reinforced double-nylon cable supporting high-speed e-Marker 100W PD charging.', 699.00, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', TRUE),
    ('PROD-CABLE-02', 'ArmorFlex Lightning to USB-C MFi Certified Cable', 'Apple licensed fast charging cord tested to withstand 30,000+ bends without fraying or signal degradation.', 899.00, 4, 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=500', TRUE),
    ('PROD-CARMOUNT-01', 'MagDrive 15W Fast Wireless Auto Car Charger Mount', 'Air-vent magnetic vehicle dock with smart infrared sensor clamping and 360-degree ball joint pivot.', 1999.00, 4, 'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=500', TRUE),
    ('PROD-ADAPTER-01', 'GlobalTravel All-in-One Universal Power Adapter', 'Covers 150+ countries (US/EU/UK/AUS/IN) with 4x USB slots, 1x Type-C, and integrated safety auto-reset fuse.', 1299.00, 4, 'https://images.unsplash.com/photo-1579721840641-7b0e6a86b97f?w=500', TRUE),
    ('PROD-HUB-02', 'ProThunderbolt 12-in-1 Dual 4K Docking Station', 'Enterprise desktop workstation hub supporting dual 4K 60Hz video output, Gigabit LAN, and audio line out.', 12999.00, 4, 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500', TRUE),

    -- Category 5: Smart Home & IoT
    ('PROD-CAM-01', 'SecureView 2K 360-Degree Indoor WiFi Camera', 'Pan-tilt smart home security camera with night vision, AI motion human tracking, and two-way voice intercom.', 2799.00, 5, 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500', TRUE),
    ('PROD-BULB-01', 'LuminaSmart 16 Million Color 12W Smart LED Bulb', 'B22/E27 smart ambient bulb with Alexa and Google Assistant integration, music sync, and wake-up sunrise timer.', 699.00, 5, 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=500', TRUE),
    ('PROD-STRIP-01', 'AmbientGlow 5m Smart WiFi RGB LED Light Strip', 'Flexible adhesive decorative light strip with addressable color zones, TV backlighting, and smartphone scheduling.', 1899.00, 5, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500', TRUE),
    ('PROD-PLUG-01', 'SmartSocket 16A WiFi Smart Plug with Energy Monitor', 'Heavy-duty smart plug for geysers and AC units with real-time electricity consumption stats and timer schedules.', 999.00, 5, 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500', TRUE),
    ('PROD-ROUTER-01', 'HyperMesh WiFi 6 Dual-Band Mesh Router System', 'Whole-home seamless roaming coverage up to 4,000 sq ft with OFDMA technology and up to 3000 Mbps throughput.', 8999.00, 5, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', TRUE),
    ('PROD-LOCK-01', 'SmartTouch Biometric Fingerprint Smart Door Lock', 'Keyless digital door security lock with 0.3s optical fingerprint recognition, passcode keypad, RFID, and emergency mechanical key.', 13499.00, 5, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', TRUE),
    ('PROD-DOORBELL-01', 'VideoGuard HD Smart Wireless Video Doorbell', 'Weatherproof front door camera with 1080p live stream, tamper alarm chime, and motion alert notifications.', 5499.00, 5, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', TRUE),
    ('PROD-PURIFIER-01', 'PureBreeze Smart HEPA Air Purifier with App Control', 'True HEPA H13 filtration capturing 99.97% of PM2.5 pollutants, smoke, and allergens with live air quality indicator ring.', 9999.00, 5, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', TRUE),

    -- Category 6: Photography & Creator Gear
    ('PROD-MIC-01', 'StudioStream USB Condenser Cardioid Podcast Mic', 'Plug-and-play desktop studio microphone with tap-to-mute sensor, gain adjustment knob, and shock-mount stand.', 4999.00, 6, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', TRUE),
    ('PROD-MIC-02', 'WirelessLavalier Dual Transmitter Lapel Mic Kit', 'Compact clip-on wireless microphone kit for vloggers and interviewers with 100m transmission and active noise reduction.', 5999.00, 6, 'https://images.unsplash.com/photo-1520523839898-50712140a33a?w=500', TRUE),
    ('PROD-RINGLIGHT-01', 'HaloLight 18-inch Bi-Color LED Ring Light with Stand', 'Professional makeup and streaming ring light with adjustable color temp (3200K-5600K) and heavy-duty 7ft light stand.', 2999.00, 6, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500', TRUE),
    ('PROD-GIMBAL-01', 'SteadyGlide 3-Axis Smartphone Handheld Gimbal', 'Motorized anti-shake stabilizer with face tracking, inception barrel roll mode, and integrated gesture control.', 7499.00, 6, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500', TRUE),
    ('PROD-TRIPOD-01', 'ProCarbon Ultralight Carbon Fiber Travel Tripod', 'Rigid 8-layer carbon fiber camera tripod with 360 panoramic ball head, Arca-Swiss plate, and inverted macro center column.', 6499.00, 6, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500', TRUE),
    ('PROD-WEBCAM-01', 'StreamVision 4K 60FPS AI Auto-Focusing Webcam', 'Ultra-sharp video conferencing camera with dual stereo noise-cancelling mics and physical magnetic privacy shutter.', 8999.00, 6, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500', TRUE),
    ('PROD-KEYLIGHT-01', 'EdgeLit Desk-Mounted Streamer LED Key Light', 'Indirect edge-lit illumination preventing eye strain during long Zoom calls, with app-controlled brightness and hue.', 4299.00, 6, 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500', TRUE),
    ('PROD-GREENSCREEN-01', 'ChromaKey Collapsible Pop-Up Green Screen', 'Wrinkle-resistant pneumatic hydraulic pull-up studio backdrop for clean background removal in OBS and Premiere.', 3199.00, 6, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500', TRUE),

    -- Category 7: Travel & Tech Bags
    ('PROD-BACKPACK-01', 'UrbanShield Weatherproof Tech Backpack', 'Sleek 22L laptop backpack with padded compartment, luggage pass-through, and waterproof ballistic nylon.', 3999.00, 7, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', TRUE),
    ('PROD-SLEEVE-01', 'ArmorSleeve Water-Resistant 15.6-inch Laptop Sleeve', 'Shock-absorbing corner armor sleeve with soft velvet inner lining and exterior zippered accessory pocket.', 1199.00, 7, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', TRUE),
    ('PROD-ORGANIZER-01', 'CableOrganizer Double-Layer Travel Tech Pouch', 'Water-repellent travel case with elastic loops for flash drives, SD cards, chargers, mouse, and power bank.', 899.00, 7, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', TRUE),
    ('PROD-SLING-01', 'CrossBody Compact EDC Daily Commuter Sling Bag', 'Minimalist anti-theft shoulder chest bag with hidden passport pocket and quick-access magnetic buckle.', 2299.00, 7, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', TRUE),
    ('PROD-BACKPACK-02', 'NomadFlight 35L Expandable Carry-on Travel Bag', 'TSA-friendly clamshell opening backpack featuring dedicated tech compartment, shoe pocket, and USB pass-through.', 5499.00, 7, 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=500', TRUE),
    ('PROD-SUITCASE-01', 'Polycarbonate Hard Shell Spinner Cabin Suitcase 20-inch', 'Ultra-durable German Makrolon luggage with TSA combination lock and 360-degree silent Hinomoto whisper wheels.', 6999.00, 7, 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500', TRUE)

ON CONFLICT (sku) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category_id = EXCLUDED.category_id,
    image_url = EXCLUDED.image_url,
    active = EXCLUDED.active;

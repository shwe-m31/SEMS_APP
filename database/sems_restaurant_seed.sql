-- SMART ENTERPRISE MANAGEMENT SYSTEM (SEMS)
-- Restaurant Category Seed Data: AtoZ Restaurant
-- Owner -> Admin -> Worker Architecture Seed Script

USE sems_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create tables if not already created by Hibernate
CREATE TABLE IF NOT EXISTS `restaurant_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) NOT NULL UNIQUE,
  `branch_id` bigint NOT NULL,
  `table_number` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `total_amount` decimal(38,2) NOT NULL DEFAULT 0.00,
  `chef_id` bigint DEFAULT NULL,
  `waiter_id` bigint DEFAULT NULL,
  `cashier_id` bigint DEFAULT NULL,
  `bill_id` bigint DEFAULT NULL,
  `notes` text,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ro_branch` (`branch_id`),
  KEY `fk_ro_chef` (`chef_id`),
  KEY `fk_ro_waiter` (`waiter_id`),
  KEY `fk_ro_cashier` (`cashier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `restaurant_order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `menu_item_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(38,2) NOT NULL,
  `total_price` decimal(38,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_roi_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `recipe_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `inventory_id` bigint DEFAULT NULL,
  `ingredient_name` varchar(255) NOT NULL,
  `quantity_per_unit` decimal(38,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_recipe_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `worker_issues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `worker_id` bigint NOT NULL,
  `branch_id` bigint NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text,
  `status` varchar(50) NOT NULL DEFAULT 'OPEN',
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_wi_worker` (`worker_id`),
  KEY `fk_wi_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `notifications` MODIFY COLUMN `type` varchar(100) NOT NULL;

-- Clean existing data
TRUNCATE TABLE `worker_issues`;
TRUNCATE TABLE `recipe_items`;
TRUNCATE TABLE `restaurant_order_items`;
TRUNCATE TABLE `restaurant_orders`;
TRUNCATE TABLE `ai_anomalies`;
TRUNCATE TABLE `ai_predictions`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `logistics`;
TRUNCATE TABLE `expenses`;
TRUNCATE TABLE `sales`;
TRUNCATE TABLE `bill_items`;
TRUNCATE TABLE `bills`;
TRUNCATE TABLE `inventory`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `worker_shifts`;
TRUNCATE TABLE `shifts`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `tasks`;
TRUNCATE TABLE `workers`;
TRUNCATE TABLE `admins`;
TRUNCATE TABLE `branches`;
TRUNCATE TABLE `organizations`;
TRUNCATE TABLE `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. OWNER USER & ORGANIZATION
-- ============================================
-- Password for all accounts: password123 ($2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
INSERT INTO users (id, username, email, password, name, phone, date_of_birth, gender, role, must_change_password, created_at, updated_at) VALUES
(1, 'owner.atoz', 'owner@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mohanraj K', '+91-9876543210', '1980-04-12', 'MALE', 'OWNER', FALSE, NOW(), NOW());

INSERT INTO organizations (id, owner_id, name, type, industry_type, category, sub_category, has_branches, created_at, updated_at) VALUES
(1, 1, 'AtoZ Restaurant', 'MEDIUM', 'FOOD_RETAIL', 'Restaurants', 'Restaurant', TRUE, NOW(), NOW());

-- ============================================
-- 2. BRANCHES
-- ============================================
INSERT INTO branches (id, organization_id, branch_code, name, state, city, pincode, location, category, organization_type, address, phone, created_at, updated_at) VALUES
(1, 1, 'A2Z-ERD-001', 'AtoZ Erode Main', 'Tamil Nadu', 'Erode', '638001', 'Erode, Tamil Nadu', 'Restaurants', 'Restaurant', '120 Brough Road, Erode', '+91-424-2221100', NOW(), NOW()),
(2, 1, 'A2Z-CBE-002', 'AtoZ Coimbatore Gandhipuram', 'Tamil Nadu', 'Coimbatore', '641012', 'Coimbatore, Tamil Nadu', 'Restaurants', 'Restaurant', '45 Cross Cut Road, Gandhipuram, Coimbatore', '+91-422-2553300', NOW(), NOW()),
(3, 1, 'A2Z-CHN-003', 'AtoZ Chennai Anna Nagar', 'Tamil Nadu', 'Chennai', '600040', 'Chennai, Tamil Nadu', 'Restaurants', 'Restaurant', '78 2nd Avenue, Anna Nagar, Chennai', '+91-44-26214400', NOW(), NOW());

-- ============================================
-- 3. BRANCH MANAGERS (ADMINS)
-- ============================================
INSERT INTO users (id, username, email, password, name, phone, date_of_birth, gender, role, must_change_password, created_at, updated_at) VALUES
(2, 'admin_a2zerd001', 'admin.erode@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Senthil Nathan', '+91-9876543211', '1986-05-18', 'MALE', 'ADMIN', FALSE, NOW(), NOW()),
(3, 'admin_a2zcbe002', 'admin.cbe@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Meenakshi Sundaram', '+91-9876543212', '1988-09-22', 'FEMALE', 'ADMIN', FALSE, NOW(), NOW()),
(4, 'admin_a2zchn003', 'admin.chn@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Venkatesh Babu', '+91-9876543213', '1987-11-04', 'MALE', 'ADMIN', FALSE, NOW(), NOW());

INSERT INTO admins (id, user_id, branch_id, designation, temporary_password, created_at, updated_at) VALUES
(1, 2, 1, 'Restaurant General Manager', 'password123', NOW(), NOW()),
(2, 3, 2, 'Branch Manager', 'password123', NOW(), NOW()),
(3, 4, 3, 'Branch Manager', 'password123', NOW(), NOW());

-- ============================================
-- 4. WORKERS FOR BRANCH 1 (ERODE - A2Z-ERD-001)
-- ============================================
INSERT INTO users (id, username, email, password, name, phone, date_of_birth, gender, role, must_change_password, created_at, updated_at) VALUES
(10, 'rahul.erd', 'rahul.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rahul Kumar', '+91-9876500001', '1992-06-14', 'MALE', 'WORKER', FALSE, NOW(), NOW()),
(11, 'suresh.erd', 'suresh.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Suresh Mani', '+91-9876500002', '1995-03-20', 'MALE', 'WORKER', FALSE, NOW(), NOW()),
(12, 'priya.erd', 'priya.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Priya Lakshmi', '+91-9876500003', '1996-08-11', 'FEMALE', 'WORKER', FALSE, NOW(), NOW()),
(13, 'kavitha.erd', 'kavitha.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kavitha Devi', '+91-9876500004', '1997-12-05', 'FEMALE', 'WORKER', FALSE, NOW(), NOW()),
(14, 'karthik.erd', 'karthik.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Karthik Raja', '+91-9876500005', '1993-01-28', 'MALE', 'WORKER', FALSE, NOW(), NOW()),
(15, 'anitha.erd', 'anitha.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Anitha Shanmugam', '+91-9876500006', '1994-10-17', 'FEMALE', 'WORKER', FALSE, NOW(), NOW()),
(16, 'arun.erd', 'arun.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Arun Prasath', '+91-9876500007', '1998-04-09', 'MALE', 'WORKER', FALSE, NOW(), NOW()),
(17, 'ramesh.erd', 'ramesh.erd@atoz.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ramesh Kannan', '+91-9876500008', '1991-07-25', 'MALE', 'WORKER', FALSE, NOW(), NOW());

INSERT INTO workers (id, user_id, branch_id, employee_id, designation, salary, hire_date, status, created_at, updated_at) VALUES
(1, 10, 1, 'A2Z-ERD-W001', 'CHEF', 28000.00, '2023-01-10', 'ACTIVE', NOW(), NOW()),
(2, 11, 1, 'A2Z-ERD-W002', 'KITCHEN_ASSISTANT', 18000.00, '2023-02-15', 'ACTIVE', NOW(), NOW()),
(3, 12, 1, 'A2Z-ERD-W003', 'WAITER', 16000.00, '2023-03-01', 'ACTIVE', NOW(), NOW()),
(4, 13, 1, 'A2Z-ERD-W004', 'WAITER', 16000.00, '2023-03-15', 'ACTIVE', NOW(), NOW()),
(5, 14, 1, 'A2Z-ERD-W005', 'CASHIER', 22000.00, '2023-01-20', 'ACTIVE', NOW(), NOW()),
(6, 15, 1, 'A2Z-ERD-W006', 'INVENTORY_WORKER', 19000.00, '2023-02-01', 'ACTIVE', NOW(), NOW()),
(7, 16, 1, 'A2Z-ERD-W007', 'DELIVERY_WORKER', 17000.00, '2023-04-10', 'ACTIVE', NOW(), NOW()),
(8, 17, 1, 'A2Z-ERD-W008', 'CLEANING_WORKER', 15000.00, '2023-01-15', 'ACTIVE', NOW(), NOW());

-- ============================================
-- 5. MENU ITEMS (PRODUCTS) - FOR BRANCH 1
-- ============================================
INSERT INTO products (id, branch_id, name, category, price, description, created_at, updated_at) VALUES
(1, 1, 'Chicken Biriyani', 'Main Course', 220.00, 'Traditional Seeraga Samba chicken biriyani with egg and raita', NOW(), NOW()),
(2, 1, 'Mutton Biriyani', 'Main Course', 320.00, 'Authentic tender mutton biriyani served with dalcha and onion salad', NOW(), NOW()),
(3, 1, 'Paneer Butter Masala', 'Curries', 180.00, 'Rich cottage cheese cubes cooked in spiced creamy tomato butter gravy', NOW(), NOW()),
(4, 1, 'Veg Fried Rice', 'Chinese', 150.00, 'Wok-tossed aromatic rice with finely cut garden vegetables', NOW(), NOW()),
(5, 1, 'Malabar Parotta', 'Breads', 30.00, 'Flaky layered Kerala parotta prepared on hot griddle', NOW(), NOW()),
(6, 1, 'Fresh Lime Juice', 'Beverages', 50.00, 'Chilled fresh lime juice with mint and natural cane sugar', NOW(), NOW()),
(7, 1, 'South Indian Filter Coffee', 'Beverages', 40.00, 'Traditional decoction filter coffee brewed with pure chicory blend', NOW(), NOW());

-- Also replicate products for Branch 2 and 3
INSERT INTO products (id, branch_id, name, category, price, description, created_at, updated_at) VALUES
(8, 2, 'Chicken Biriyani', 'Main Course', 220.00, 'Traditional chicken biriyani', NOW(), NOW()),
(9, 2, 'Mutton Biriyani', 'Main Course', 320.00, 'Authentic tender mutton biriyani', NOW(), NOW()),
(10, 2, 'Paneer Butter Masala', 'Curries', 180.00, 'Creamy paneer butter masala', NOW(), NOW()),
(11, 3, 'Chicken Biriyani', 'Main Course', 240.00, 'Traditional chicken biriyani', NOW(), NOW()),
(12, 3, 'Mutton Biriyani', 'Main Course', 340.00, 'Authentic tender mutton biriyani', NOW(), NOW());

-- ============================================
-- 6. RAW INGREDIENT INVENTORY - BRANCH 1
-- ============================================
INSERT INTO inventory (id, branch_id, name, category, quantity, unit, minimum_stock_level, supplier, created_at, last_updated) VALUES
(1, 1, 'Basmati Rice', 'RAW_MATERIAL', 95.50, 'kg', 25.00, 'Kaveri Agro Traders', NOW(), NOW()),
(2, 1, 'Fresh Chicken', 'RAW_MATERIAL', 48.00, 'kg', 15.00, 'Suguna Farms', NOW(), NOW()),
(3, 1, 'Tender Mutton', 'RAW_MATERIAL', 32.50, 'kg', 10.00, 'Kongu Meats', NOW(), NOW()),
(4, 1, 'Fresh Paneer', 'RAW_MATERIAL', 22.00, 'kg', 8.00, 'Aavin Dairy', NOW(), NOW()),
(5, 1, 'Cooking Oil', 'RAW_MATERIAL', 58.00, 'L', 20.00, 'Gold Winner Refinery', NOW(), NOW()),
(6, 1, 'Biriyani Spices Mix', 'RAW_MATERIAL', 18.50, 'kg', 5.00, 'Sakthi Masala', NOW(), NOW()),
(7, 1, 'Dairy Milk', 'RAW_MATERIAL', 38.00, 'L', 10.00, 'Aavin Dairy', NOW(), NOW()),
(8, 1, 'Coffee Powder', 'RAW_MATERIAL', 14.20, 'kg', 4.00, 'Leo Coffee', NOW(), NOW()),
(9, 1, 'Fresh Limes', 'RAW_MATERIAL', 12.00, 'kg', 3.00, 'Local Wholesale Market', NOW(), NOW());

-- Replicate core inventory for Branch 2 & 3
INSERT INTO inventory (id, branch_id, name, category, quantity, unit, minimum_stock_level, supplier, created_at, last_updated) VALUES
(10, 2, 'Basmati Rice', 'RAW_MATERIAL', 80.00, 'kg', 20.00, 'Kaveri Agro Traders', NOW(), NOW()),
(11, 2, 'Fresh Chicken', 'RAW_MATERIAL', 40.00, 'kg', 15.00, 'Suguna Farms', NOW(), NOW()),
(12, 3, 'Basmati Rice', 'RAW_MATERIAL', 110.00, 'kg', 25.00, 'Kaveri Agro Traders', NOW(), NOW()),
(13, 3, 'Fresh Chicken', 'RAW_MATERIAL', 55.00, 'kg', 20.00, 'Suguna Farms', NOW(), NOW());

-- ============================================
-- 7. RECIPE MAPPINGS (Product -> Raw Ingredients)
-- ============================================
-- Chicken Biriyani (Product 1): Rice 0.25kg, Chicken 0.20kg, Oil 0.03L, Spices 0.02kg
INSERT INTO recipe_items (product_id, inventory_id, ingredient_name, quantity_per_unit, unit) VALUES
(1, 1, 'Basmati Rice', 0.25, 'kg'),
(1, 2, 'Fresh Chicken', 0.20, 'kg'),
(1, 5, 'Cooking Oil', 0.03, 'L'),
(1, 6, 'Biriyani Spices Mix', 0.02, 'kg');

-- Mutton Biriyani (Product 2): Rice 0.25kg, Mutton 0.22kg, Oil 0.04L, Spices 0.03kg
INSERT INTO recipe_items (product_id, inventory_id, ingredient_name, quantity_per_unit, unit) VALUES
(2, 1, 'Basmati Rice', 0.25, 'kg'),
(2, 3, 'Tender Mutton', 0.22, 'kg'),
(2, 5, 'Cooking Oil', 0.04, 'L'),
(2, 6, 'Biriyani Spices Mix', 0.03, 'kg');

-- Paneer Butter Masala (Product 3): Paneer 0.15kg, Oil 0.02L, Spices 0.02kg
INSERT INTO recipe_items (product_id, inventory_id, ingredient_name, quantity_per_unit, unit) VALUES
(3, 4, 'Fresh Paneer', 0.15, 'kg'),
(3, 5, 'Cooking Oil', 0.02, 'L'),
(3, 6, 'Biriyani Spices Mix', 0.02, 'kg');

-- Filter Coffee (Product 7): Coffee Powder 0.02kg, Milk 0.15L
INSERT INTO recipe_items (product_id, inventory_id, ingredient_name, quantity_per_unit, unit) VALUES
(7, 8, 'Coffee Powder', 0.02, 'kg'),
(7, 7, 'Dairy Milk', 0.15, 'L');

-- ============================================
-- 8. SHIFTS & WORKER SHIFTS - BRANCH 1
-- ============================================
INSERT INTO shifts (id, branch_id, name, start_time, end_time, description) VALUES
(1, 1, 'Morning Shift', '07:00:00', '15:00:00', 'Breakfast & Lunch service operation'),
(2, 1, 'Evening Shift', '15:00:00', '23:00:00', 'Dinner & Night takeaway operation');

INSERT INTO worker_shifts (worker_id, shift_id, date) VALUES
(1, 1, CURDATE()), -- Chef in Morning Shift
(2, 1, CURDATE()), -- Kitchen Asst in Morning Shift
(3, 1, CURDATE()), -- Waiter 1 in Morning Shift
(4, 2, CURDATE()), -- Waiter 2 in Evening Shift
(5, 1, CURDATE()), -- Cashier in Morning Shift
(6, 1, CURDATE()), -- Inventory in Morning Shift
(7, 2, CURDATE()), -- Delivery in Evening Shift
(8, 1, CURDATE()); -- Cleaner in Morning Shift

-- ============================================
-- 9. ATTENDANCE TODAY
-- ============================================
INSERT INTO attendance (worker_id, branch_id, date, check_in_time, status) VALUES
(1, 1, CURDATE(), '06:55:00', 'PRESENT'),
(2, 1, CURDATE(), '07:02:00', 'PRESENT'),
(3, 1, CURDATE(), '06:58:00', 'PRESENT'),
(5, 1, CURDATE(), '06:50:00', 'PRESENT'),
(6, 1, CURDATE(), '07:10:00', 'PRESENT'),
(8, 1, CURDATE(), '06:45:00', 'PRESENT');

-- ============================================
-- 10. ACTIVE TASKS
-- ============================================
INSERT INTO tasks (branch_id, assigned_to, assigned_by, title, description, priority, status, due_date, created_at, updated_at) VALUES
(1, 1, 1, 'Prepare Biriyani Marination Batch #1', 'Marinate 25 kg chicken with yogurt, mint and biriyani spice mix for lunch crowd', 'HIGH', 'IN_PROGRESS', CURDATE(), NOW(), NOW()),
(1, 2, 1, 'Chop Onions & Coriander', 'Slice 15 kg onions for frying and garnish', 'MEDIUM', 'PENDING', CURDATE(), NOW(), NOW()),
(1, 6, 1, 'Inspect Dairy & Fresh Chicken Inflow', 'Check temperature of morning meat delivery from Suguna Farms', 'HIGH', 'COMPLETED', CURDATE(), NOW(), NOW()),
(1, 8, 1, 'Sanitize Dining Hall Tables 1-15', 'Full morning floor and tabletop disinfection', 'MEDIUM', 'COMPLETED', CURDATE(), NOW(), NOW());

-- ============================================
-- 11. RESTAURANT ORDERS (ACTIVE PIPELINE)
-- ============================================
-- Order 1: CREATED (Ready for Chef to Accept)
INSERT INTO restaurant_orders (id, order_number, branch_id, table_number, customer_name, status, total_amount, waiter_id, notes, created_at, updated_at) VALUES
(1, 'ORD-2024-1001', 1, 'Table 4', 'Rajaraman', 'CREATED', 490.00, 3, 'Less spicy biriyani please', NOW() - INTERVAL 10 MINUTE, NOW() - INTERVAL 10 MINUTE);

INSERT INTO restaurant_order_items (order_id, product_id, menu_item_name, quantity, unit_price, total_price) VALUES
(1, 1, 'Chicken Biriyani', 2, 220.00, 440.00),
(2, 6, 'Fresh Lime Juice', 1, 50.00, 50.00);

-- Order 2: PREPARING (Chef Rahul is cooking)
INSERT INTO restaurant_orders (id, order_number, branch_id, table_number, customer_name, status, total_amount, chef_id, waiter_id, notes, created_at, updated_at) VALUES
(2, 'ORD-2024-1002', 1, 'Table 8', 'Kavya S', 'PREPARING', 500.00, 1, 3, 'Extra raita', NOW() - INTERVAL 25 MINUTE, NOW() - INTERVAL 5 MINUTE);

INSERT INTO restaurant_order_items (order_id, product_id, menu_item_name, quantity, unit_price, total_price) VALUES
(3, 2, 'Mutton Biriyani', 1, 320.00, 320.00),
(4, 3, 'Paneer Butter Masala', 1, 180.00, 180.00);

-- Order 3: READY (Prepared by Chef, awaiting Waiter service)
INSERT INTO restaurant_orders (id, order_number, branch_id, table_number, customer_name, status, total_amount, chef_id, waiter_id, notes, created_at, updated_at) VALUES
(3, 'ORD-2024-1003', 1, 'Table 12', 'Dr. Arvind', 'READY', 260.00, 1, 3, 'Serve piping hot', NOW() - INTERVAL 35 MINUTE, NOW() - INTERVAL 2 MINUTE);

INSERT INTO restaurant_order_items (order_id, product_id, menu_item_name, quantity, unit_price, total_price) VALUES
(5, 1, 'Chicken Biriyani', 1, 220.00, 220.00),
(6, 7, 'South Indian Filter Coffee', 1, 40.00, 40.00);

-- Order 4: SERVED (Delivered to Table 2, awaiting Cashier payment)
INSERT INTO restaurant_orders (id, order_number, branch_id, table_number, customer_name, status, total_amount, chef_id, waiter_id, notes, created_at, updated_at) VALUES
(4, 'ORD-2024-1004', 1, 'Table 2', 'Naveen Kumar', 'SERVED', 370.00, 1, 3, 'Customer requested bill', NOW() - INTERVAL 45 MINUTE, NOW() - INTERVAL 12 MINUTE);

INSERT INTO restaurant_order_items (order_id, product_id, menu_item_name, quantity, unit_price, total_price) VALUES
(7, 4, 'Veg Fried Rice', 1, 150.00, 150.00),
(8, 3, 'Paneer Butter Masala', 1, 180.00, 180.00),
(9, 7, 'South Indian Filter Coffee', 1, 40.00, 40.00);

-- ============================================
-- 12. COMPLETED ORDER, BILL & SALES (PAID FLOW)
-- ============================================
INSERT INTO bills (id, branch_id, bill_number, customer_name, subtotal, discount, tax, total_amount, payment_method, created_by, created_at) VALUES
(1, 1, 'BILL-2024-00101', 'Table 6 (Karthik)', 440.00, 0.00, 22.00, 462.00, 'UPI', 5, NOW() - INTERVAL 2 HOUR);

INSERT INTO bill_items (bill_id, product_id, product_name, quantity, price, total) VALUES
(1, 1, 'Chicken Biriyani', 2.00, 220.00, 440.00);

INSERT INTO restaurant_orders (id, order_number, branch_id, table_number, customer_name, status, total_amount, chef_id, waiter_id, cashier_id, bill_id, created_at, updated_at) VALUES
(5, 'ORD-2024-1000', 1, 'Table 6', 'Karthik', 'COMPLETED', 440.00, 1, 3, 5, 1, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR);

INSERT INTO restaurant_order_items (order_id, product_id, menu_item_name, quantity, unit_price, total_price) VALUES
(10, 1, 'Chicken Biriyani', 2, 220.00, 440.00);

INSERT INTO sales (branch_id, bill_id, product_id, product_name, quantity, amount, sale_date, created_at) VALUES
(1, 1, 1, 'Chicken Biriyani', 2.00, 440.00, CURDATE(), NOW() - INTERVAL 1 HOUR);

-- Additional sales records for realistic trends
INSERT INTO sales (branch_id, product_name, quantity, amount, sale_date, created_at) VALUES
(1, 'Chicken Biriyani', 32.00, 7040.00, CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
(1, 'Mutton Biriyani', 18.00, 5760.00, CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
(1, 'Chicken Biriyani', 45.00, 9900.00, CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
(2, 'Chicken Biriyani', 28.00, 6160.00, CURDATE(), NOW()),
(3, 'Chicken Biriyani', 50.00, 12000.00, CURDATE(), NOW());

-- ============================================
-- 13. EXPENSES
-- ============================================
INSERT INTO expenses (branch_id, category, amount, description, expense_date, created_at) VALUES
(1, 'INVENTORY', 14500.00, 'Daily fresh chicken and mutton procurement', CURDATE(), NOW()),
(1, 'MAINTENANCE', 1800.00, 'Commercial LPG gas cylinder refill', CURDATE(), NOW()),
(2, 'INVENTORY', 12000.00, 'Vegetables and dairy supply', CURDATE(), NOW()),
(3, 'INVENTORY', 18500.00, 'Meat and spice restocking', CURDATE(), NOW());

-- ============================================
-- 14. WORKER ISSUES
-- ============================================
INSERT INTO worker_issues (worker_id, branch_id, category, description, status, created_at) VALUES
(1, 1, 'Ingredient Shortage', 'Low Basmati Rice stock remaining for evening dinner preparation. Need 40 kg restock.', 'OPEN', NOW() - INTERVAL 40 MINUTE);

-- ============================================
-- 15. NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, branch_id, type, title, message, is_read, created_at) VALUES
(2, 1, 'ORDER_CREATED', 'New Order: ORD-2024-1001', 'Table 4 placed order for Chicken Biriyani x 2', FALSE, NOW() - INTERVAL 10 MINUTE),
(2, 1, 'WORKER_ISSUE', 'Worker Incident: Ingredient Shortage', 'Chef Rahul: Low Basmati Rice stock remaining for evening dinner preparation.', FALSE, NOW() - INTERVAL 40 MINUTE),
(1, 1, 'AI_DEMAND_WARNING', 'Inventory Demand Alert', 'Chicken Biriyani demand projected to spike 25% this weekend.', FALSE, NOW() - INTERVAL 3 HOUR);

-- SMART ENTERPRISE MANAGEMENT SYSTEM (SEMS)
-- Bakery-Specific Seed Data for FreshBake Foods
-- This file creates a complete operational bakery organization

USE sems_db;

-- ============================================
-- CLEANUP EXISTING DATA (for re-seeding)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ai_anomalies;
TRUNCATE TABLE ai_predictions;
TRUNCATE TABLE notifications;
TRUNCATE TABLE logistics;
TRUNCATE TABLE expenses;
TRUNCATE TABLE sales;
TRUNCATE TABLE bill_items;
TRUNCATE TABLE bills;
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE worker_shifts;
TRUNCATE TABLE shifts;
TRUNCATE TABLE attendance;
TRUNCATE TABLE tasks;
TRUNCATE TABLE workers;
TRUNCATE TABLE admins;
TRUNCATE TABLE branches;
TRUNCATE TABLE organizations;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- INSERT OWNER USER
-- ============================================
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('owner@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mohanraj', '+91-9876543210', '1975-03-15', 'MALE', 'OWNER');

-- ============================================
-- INSERT ORGANIZATION
-- ============================================
INSERT INTO organizations (owner_id, name, type, industry_type, has_branches) VALUES
(1, 'FreshBake Foods', 'MEDIUM', 'FOOD_RETAIL', TRUE);

-- ============================================
-- INSERT BRANCHES
-- ============================================
INSERT INTO branches (organization_id, name, location, address, phone) VALUES
(1, 'FreshBake Central Bakery', 'Chennai', '123 Bakery Street, Anna Nagar, Chennai', '+91-44-23456789'),
(1, 'FreshBake Coimbatore', 'Coimbatore', '456 Food Park, Gandhipuram, Coimbatore', '+91-422-34567890'),
(1, 'FreshBake Erode', 'Erode', '789 Market Road, Erode', '+91-424-45678901');

-- ============================================
-- INSERT MANAGER USERS
-- ============================================
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('manager.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Priya', '+91-9876543211', '1985-08-20', 'FEMALE', 'ADMIN'),
('manager.coimbatore@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Karthik', '+91-9876543212', '1987-12-10', 'MALE', 'ADMIN'),
('manager.erode@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Divya', '+91-9876543213', '1986-03-25', 'FEMALE', 'ADMIN');

-- ============================================
-- INSERT ADMINS (Managers) mapping to branches
-- ============================================
INSERT INTO admins (user_id, branch_id, designation) VALUES
(2, 1, 'Branch Manager'),
(3, 2, 'Branch Manager'),
(4, 3, 'Branch Manager');

-- ============================================
-- INSERT WORKER USERS - CHENNAI BRANCH
-- ============================================
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('ravi.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ravi Kumar', '+91-9876543221', '1990-06-15', 'MALE', 'WORKER'),
('karthik.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Karthik Raj', '+91-9876543222', '1992-09-20', 'MALE', 'WORKER'),
('divya.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Divya S', '+91-9876543223', '1994-04-10', 'FEMALE', 'WORKER'),
('meena.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Meena Devi', '+91-9876543224', '1991-11-25', 'FEMALE', 'WORKER'),
('arun.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Arun Prakash', '+91-9876543225', '1993-02-18', 'MALE', 'WORKER');

-- ============================================
-- INSERT WORKER USERS - COIMBATORE BRANCH
-- ============================================
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('lakshmi.coimbatore@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lakshmi', '+91-9876543231', '1989-07-30', 'FEMALE', 'WORKER'),
('suresh.coimbatore@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Suresh', '+91-9876543232', '1991-01-12', 'MALE', 'WORKER'),
('anitha.coimbatore@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Anitha', '+91-9876543233', '1990-08-22', 'FEMALE', 'WORKER'),
('kumar.coimbatore@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kumar', '+91-9876543234', '1992-03-08', 'MALE', 'WORKER'),
('priya.coimbatore@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Priya', '+91-9876543235', '1993-12-15', 'FEMALE', 'WORKER');

-- ============================================
-- INSERT WORKER USERS - ERODE BRANCH
-- ============================================
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('mohan.erode@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mohan', '+91-9876543241', '1988-09-10', 'MALE', 'WORKER'),
('devi.erode@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Devi', '+91-9876543242', '1990-06-20', 'FEMALE', 'WORKER'),
('raj.erode@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Raj', '+91-9876543243', '1991-11-30', 'MALE', 'WORKER'),
('kavitha.erode@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kavitha', '+91-9876543244', '1992-05-25', 'FEMALE', 'WORKER'),
('ramesh.erode@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ramesh', '+91-9876543245', '1993-08-05', 'MALE', 'WORKER');

-- ============================================
-- INSERT WORKERS mapping to branches - CHENNAI
-- ============================================
INSERT INTO workers (user_id, branch_id, employee_id, designation, salary, hire_date, status) VALUES
(5, 1, 'FB-CH-001', 'Baker', 25000.00, '2023-01-15', 'ACTIVE'),
(6, 1, 'FB-CH-002', 'Production Worker', 22000.00, '2023-02-01', 'ACTIVE'),
(7, 1, 'FB-CH-003', 'Inventory Assistant', 20000.00, '2023-03-10', 'ACTIVE'),
(8, 1, 'FB-CH-004', 'Sales Executive', 21000.00, '2023-04-05', 'ACTIVE'),
(9, 1, 'FB-CH-005', 'Packing Worker', 19000.00, '2023-05-20', 'ACTIVE');

-- ============================================
-- INSERT WORKERS mapping to branches - COIMBATORE
-- ============================================
INSERT INTO workers (user_id, branch_id, employee_id, designation, salary, hire_date, status) VALUES
(10, 2, 'FB-CB-001', 'Cashier', 20000.00, '2023-01-20', 'ACTIVE'),
(11, 2, 'FB-CB-002', 'Delivery Worker', 19000.00, '2023-02-15', 'ACTIVE'),
(12, 2, 'FB-CB-003', 'Baker', 25000.00, '2023-03-25', 'ACTIVE'),
(13, 2, 'FB-CB-004', 'Production Worker', 22000.00, '2023-04-10', 'ACTIVE'),
(14, 2, 'FB-CB-005', 'Sales Executive', 21000.00, '2023-05-15', 'ACTIVE');

-- ============================================
-- INSERT WORKERS mapping to branches - ERODE
-- ============================================
INSERT INTO workers (user_id, branch_id, employee_id, designation, salary, hire_date, status) VALUES
(15, 3, 'FB-ER-001', 'Baker', 25000.00, '2023-01-10', 'ACTIVE'),
(16, 3, 'FB-ER-002', 'Inventory Assistant', 20000.00, '2023-02-20', 'ACTIVE'),
(17, 3, 'FB-ER-003', 'Packing Worker', 19000.00, '2023-03-30', 'ACTIVE'),
(18, 3, 'FB-ER-004', 'Delivery Worker', 19000.00, '2023-04-15', 'ACTIVE'),
(19, 3, 'FB-ER-005', 'Production Worker', 22000.00, '2023-05-25', 'ACTIVE');

-- ============================================
-- INSERT SHIFTS - CHENNAI
-- ============================================
INSERT INTO shifts (branch_id, name, start_time, end_time, description) VALUES
(1, 'Morning Shift', '06:00:00', '14:00:00', 'Early morning baking shift'),
(1, 'Afternoon Shift', '14:00:00', '22:00:00', 'Afternoon sales and packing shift'),
(1, 'Night Shift', '22:00:00', '06:00:00', 'Night production shift');

-- ============================================
-- INSERT SHIFTS - COIMBATORE
-- ============================================
INSERT INTO shifts (branch_id, name, start_time, end_time, description) VALUES
(2, 'Morning Shift', '07:00:00', '15:00:00', 'Morning operations'),
(2, 'Evening Shift', '15:00:00', '23:00:00', 'Evening operations');

-- ============================================
-- INSERT SHIFTS - ERODE
-- ============================================
INSERT INTO shifts (branch_id, name, start_time, end_time, description) VALUES
(3, 'Day Shift', '09:00:00', '18:00:00', 'Regular day operations');

-- ============================================
-- INSERT WORKER SHIFT ASSIGNMENTS (TODAY)
-- ============================================
INSERT INTO worker_shifts (worker_id, shift_id, date) VALUES
-- Chennai workers
(1, 1, CURDATE()),
(2, 1, CURDATE()),
(3, 2, CURDATE()),
(4, 2, CURDATE()),
(5, 1, CURDATE()),
-- Coimbatore workers
(6, 4, CURDATE()),
(7, 4, CURDATE()),
(8, 5, CURDATE()),
(9, 4, CURDATE()),
(10, 5, CURDATE()),
-- Erode workers
(11, 6, CURDATE()),
(12, 6, CURDATE()),
(13, 6, CURDATE()),
(14, 6, CURDATE()),
(15, 6, CURDATE());

-- ============================================
-- INSERT PRODUCTS - CHENNAI
-- ============================================
INSERT INTO products (branch_id, name, category, price, description) VALUES
(1, 'Bread', 'Bakery', 45.00, 'Fresh daily bread'),
(1, 'Milk Bread', 'Bakery', 50.00, 'Soft milk bread'),
(1, 'Whole Wheat Bread', 'Bakery', 55.00, 'Healthy whole wheat bread'),
(1, 'Veg Puff', 'Snacks', 30.00, 'Vegetable puff pastry'),
(1, 'Egg Puff', 'Snacks', 35.00, 'Egg puff pastry'),
(1, 'Chicken Puff', 'Snacks', 45.00, 'Chicken puff pastry'),
(1, 'Chocolate Cake', 'Cakes', 650.00, 'Rich chocolate cake'),
(1, 'Vanilla Cake', 'Cakes', 550.00, 'Classic vanilla cake'),
(1, 'Black Forest Cake', 'Cakes', 700.00, 'Black forest cake'),
(1, 'Red Velvet Cake', 'Cakes', 750.00, 'Red velvet cake'),
(1, 'Donut', 'Snacks', 40.00, 'Glazed donut'),
(1, 'Croissant', 'Bakery', 60.00, 'Butter croissant'),
(1, 'Chocolate Pastry', 'Pastry', 80.00, 'Chocolate pastry'),
(1, 'Cookies', 'Snacks', 25.00, 'Assorted cookies'),
(1, 'Brownie', 'Snacks', 70.00, 'Fudgy brownie'),
(1, 'Bun', 'Bakery', 20.00, 'Soft bun');

-- ============================================
-- INSERT PRODUCTS - COIMBATORE
-- ============================================
INSERT INTO products (branch_id, name, category, price, description) VALUES
(2, 'Bread', 'Bakery', 45.00, 'Fresh daily bread'),
(2, 'Milk Bread', 'Bakery', 50.00, 'Soft milk bread'),
(2, 'Veg Puff', 'Snacks', 30.00, 'Vegetable puff pastry'),
(2, 'Chocolate Cake', 'Cakes', 650.00, 'Rich chocolate cake'),
(2, 'Vanilla Cake', 'Cakes', 550.00, 'Classic vanilla cake'),
(2, 'Donut', 'Snacks', 40.00, 'Glazed donut'),
(2, 'Croissant', 'Bakery', 60.00, 'Butter croissant'),
(2, 'Cookies', 'Snacks', 25.00, 'Assorted cookies'),
(2, 'Bun', 'Bakery', 20.00, 'Soft bun');

-- ============================================
-- INSERT PRODUCTS - ERODE
-- ============================================
INSERT INTO products (branch_id, name, category, price, description) VALUES
(3, 'Bread', 'Bakery', 45.00, 'Fresh daily bread'),
(3, 'Veg Puff', 'Snacks', 30.00, 'Vegetable puff pastry'),
(3, 'Chocolate Cake', 'Cakes', 650.00, 'Rich chocolate cake'),
(3, 'Donut', 'Snacks', 40.00, 'Glazed donut'),
(3, 'Cookies', 'Snacks', 25.00, 'Assorted cookies'),
(3, 'Bun', 'Bakery', 20.00, 'Soft bun');

-- ============================================
-- INSERT INVENTORY (RAW MATERIALS) - CHENNAI
-- ============================================
INSERT INTO inventory (branch_id, name, category, quantity, unit, minimum_stock_level, supplier) VALUES
(1, 'Wheat Flour', 'RAW_MATERIAL', 500.00, 'kg', 100.00, 'Local Mill'),
(1, 'Sugar', 'RAW_MATERIAL', 300.00, 'kg', 50.00, 'Sugar Suppliers Ltd'),
(1, 'Butter', 'RAW_MATERIAL', 150.00, 'kg', 30.00, 'Dairy Farm'),
(1, 'Milk', 'RAW_MATERIAL', 200.00, 'liters', 50.00, 'Fresh Milk Co'),
(1, 'Eggs', 'RAW_MATERIAL', 500.00, 'pieces', 100.00, 'Poultry Farm'),
(1, 'Yeast', 'RAW_MATERIAL', 50.00, 'kg', 10.00, 'Bakery Supplies'),
(1, 'Cocoa Powder', 'RAW_MATERIAL', 40.00, 'kg', 10.00, 'Cocoa Imports'),
(1, 'Cream', 'RAW_MATERIAL', 80.00, 'liters', 20.00, 'Dairy Farm'),
(1, 'Chocolate', 'RAW_MATERIAL', 60.00, 'kg', 15.00, 'Chocolate Co'),
(1, 'Vanilla Essence', 'RAW_MATERIAL', 10.00, 'liters', 2.00, 'Flavor House'),
(1, 'Salt', 'RAW_MATERIAL', 100.00, 'kg', 20.00, 'Salt Traders'),
(1, 'Cooking Oil', 'RAW_MATERIAL', 150.00, 'liters', 30.00, 'Oil Suppliers'),
(1, 'Packaging Boxes', 'SUPPLY', 1000.00, 'pieces', 200.00, 'Packaging Co'),
(1, 'Cake Boards', 'SUPPLY', 500.00, 'pieces', 100.00, 'Packaging Co');

-- ============================================
-- INSERT INVENTORY (RAW MATERIALS) - COIMBATORE
-- ============================================
INSERT INTO inventory (branch_id, name, category, quantity, unit, minimum_stock_level, supplier) VALUES
(2, 'Wheat Flour', 'RAW_MATERIAL', 400.00, 'kg', 100.00, 'Local Mill'),
(2, 'Sugar', 'RAW_MATERIAL', 250.00, 'kg', 50.00, 'Sugar Suppliers Ltd'),
(2, 'Butter', 'RAW_MATERIAL', 120.00, 'kg', 30.00, 'Dairy Farm'),
(2, 'Milk', 'RAW_MATERIAL', 150.00, 'liters', 50.00, 'Fresh Milk Co'),
(2, 'Eggs', 'RAW_MATERIAL', 400.00, 'pieces', 100.00, 'Poultry Farm'),
(2, 'Yeast', 'RAW_MATERIAL', 40.00, 'kg', 10.00, 'Bakery Supplies'),
(2, 'Cocoa Powder', 'RAW_MATERIAL', 30.00, 'kg', 10.00, 'Cocoa Imports'),
(2, 'Cream', 'RAW_MATERIAL', 60.00, 'liters', 20.00, 'Dairy Farm'),
(2, 'Chocolate', 'RAW_MATERIAL', 50.00, 'kg', 15.00, 'Chocolate Co'),
(2, 'Vanilla Essence', 'RAW_MATERIAL', 8.00, 'liters', 2.00, 'Flavor House'),
(2, 'Salt', 'RAW_MATERIAL', 80.00, 'kg', 20.00, 'Salt Traders'),
(2, 'Cooking Oil', 'RAW_MATERIAL', 120.00, 'liters', 30.00, 'Oil Suppliers'),
(2, 'Packaging Boxes', 'SUPPLY', 800.00, 'pieces', 200.00, 'Packaging Co');

-- ============================================
-- INSERT INVENTORY (RAW MATERIALS) - ERODE
-- ============================================
INSERT INTO inventory (branch_id, name, category, quantity, unit, minimum_stock_level, supplier) VALUES
(3, 'Wheat Flour', 'RAW_MATERIAL', 300.00, 'kg', 100.00, 'Local Mill'),
(3, 'Sugar', 'RAW_MATERIAL', 200.00, 'kg', 50.00, 'Sugar Suppliers Ltd'),
(3, 'Butter', 'RAW_MATERIAL', 100.00, 'kg', 30.00, 'Dairy Farm'),
(3, 'Milk', 'RAW_MATERIAL', 100.00, 'liters', 50.00, 'Fresh Milk Co'),
(3, 'Eggs', 'RAW_MATERIAL', 300.00, 'pieces', 100.00, 'Poultry Farm'),
(3, 'Yeast', 'RAW_MATERIAL', 30.00, 'kg', 10.00, 'Bakery Supplies'),
(3, 'Cocoa Powder', 'RAW_MATERIAL', 25.00, 'kg', 10.00, 'Cocoa Imports'),
(3, 'Cream', 'RAW_MATERIAL', 50.00, 'liters', 20.00, 'Dairy Farm'),
(3, 'Chocolate', 'RAW_MATERIAL', 40.00, 'kg', 15.00, 'Chocolate Co'),
(3, 'Vanilla Essence', 'RAW_MATERIAL', 6.00, 'liters', 2.00, 'Flavor House'),
(3, 'Salt', 'RAW_MATERIAL', 60.00, 'kg', 20.00, 'Salt Traders'),
(3, 'Cooking Oil', 'RAW_MATERIAL', 100.00, 'liters', 30.00, 'Oil Suppliers'),
(3, 'Packaging Boxes', 'SUPPLY', 600.00, 'pieces', 200.00, 'Packaging Co');

-- ============================================
-- INSERT TASKS - CHENNAI
-- ============================================
INSERT INTO tasks (branch_id, assigned_to, assigned_by, title, description, priority, status, due_date) VALUES
(1, 1, 1, 'Prepare 100 bread loaves', 'Bake 100 loaves of bread for morning delivery', 'HIGH', 'IN_PROGRESS', CURDATE()),
(1, 2, 1, 'Prepare birthday cake orders', 'Complete 5 birthday cake orders for today', 'URGENT', 'PENDING', CURDATE()),
(1, 5, 1, 'Pack 50 pastry boxes', 'Pack 50 pastry boxes for retail distribution', 'MEDIUM', 'PENDING', CURDATE()),
(1, 3, 1, 'Restock flour', 'Restock flour from inventory to production area', 'MEDIUM', 'COMPLETED', CURDATE()),
(1, 1, 1, 'Clean production area', 'Clean and sanitize production area', 'LOW', 'PENDING', CURDATE()),
(1, 2, 1, 'Prepare evening batch', 'Prepare evening batch of cookies and pastries', 'HIGH', 'PENDING', CURDATE());

-- ============================================
-- INSERT TASKS - COIMBATORE
-- ============================================
INSERT INTO tasks (branch_id, assigned_to, assigned_by, title, description, priority, status, due_date) VALUES
(2, 8, 2, 'Prepare morning bread batch', 'Bake morning bread batch', 'HIGH', 'IN_PROGRESS', CURDATE()),
(2, 7, 2, 'Load delivery orders', 'Load delivery orders for morning distribution', 'HIGH', 'PENDING', CURDATE()),
(2, 6, 2, 'Organize display counter', 'Organize display counter with fresh items', 'MEDIUM', 'COMPLETED', CURDATE()),
(2, 9, 2, 'Restock inventory', 'Restock inventory shelves', 'MEDIUM', 'PENDING', CURDATE());

-- ============================================
-- INSERT TASKS - ERODE
-- ============================================
INSERT INTO tasks (branch_id, assigned_to, assigned_by, title, description, priority, status, due_date) VALUES
(3, 11, 3, 'Prepare special orders', 'Prepare special cake orders for the day', 'URGENT', 'IN_PROGRESS', CURDATE()),
(3, 12, 3, 'Pack delivery items', 'Pack items for delivery', 'HIGH', 'PENDING', CURDATE()),
(3, 13, 3, 'Clean kitchen', 'Clean and organize kitchen area', 'LOW', 'COMPLETED', CURDATE()),
(3, 11, 3, 'Quality check', 'Perform quality check on finished products', 'MEDIUM', 'PENDING', CURDATE());

-- ============================================
-- INSERT ATTENDANCE - TODAY (ALL BRANCHES)
-- ============================================
-- Chennai
INSERT INTO attendance (worker_id, branch_id, date, check_in_time, check_out_time, status, notes) VALUES
(1, 1, CURDATE(), '06:00:00', NULL, 'PRESENT', 'On time'),
(2, 1, CURDATE(), '06:15:00', NULL, 'PRESENT', 'On time'),
(3, 1, CURDATE(), '07:00:00', NULL, 'PRESENT', 'On time'),
(4, 1, CURDATE(), '08:00:00', NULL, 'PRESENT', 'On time'),
(5, 1, CURDATE(), '06:30:00', NULL, 'PRESENT', 'On time');

-- Coimbatore
INSERT INTO attendance (worker_id, branch_id, date, check_in_time, check_out_time, status, notes) VALUES
(6, 2, CURDATE(), '07:00:00', NULL, 'PRESENT', 'On time'),
(7, 2, CURDATE(), '07:30:00', NULL, 'PRESENT', 'On time'),
(8, 2, CURDATE(), '08:00:00', NULL, 'PRESENT', 'On time'),
(9, 2, CURDATE(), '07:15:00', NULL, 'PRESENT', 'On time'),
(10, 2, CURDATE(), '08:30:00', NULL, 'LATE', 'Traffic delay');

-- Erode
INSERT INTO attendance (worker_id, branch_id, date, check_in_time, check_out_time, status, notes) VALUES
(11, 3, CURDATE(), '09:00:00', NULL, 'PRESENT', 'On time'),
(12, 3, CURDATE(), '09:15:00', NULL, 'PRESENT', 'On time'),
(13, 3, CURDATE(), '09:30:00', NULL, 'PRESENT', 'On time'),
(14, 3, CURDATE(), '09:00:00', NULL, 'PRESENT', 'On time'),
(15, 3, CURDATE(), '09:45:00', NULL, 'LATE', 'Personal emergency');

-- ============================================
-- INSERT HISTORICAL ATTENDANCE (LAST 7 DAYS)
-- ============================================
-- Yesterday's attendance
INSERT INTO attendance (worker_id, branch_id, date, check_in_time, check_out_time, status, notes) VALUES
(1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '06:00:00', '14:00:00', 'PRESENT', 'Full day'),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '06:15:00', '14:15:00', 'PRESENT', 'Full day'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:00:00', '15:00:00', 'PRESENT', 'Full day'),
(4, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:00:00', '16:00:00', 'PRESENT', 'Full day'),
(5, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '06:30:00', '14:30:00', 'PRESENT', 'Full day'),
(6, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:00:00', '15:00:00', 'PRESENT', 'Full day'),
(7, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:30:00', '15:30:00', 'PRESENT', 'Full day'),
(8, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:00:00', '16:00:00', 'PRESENT', 'Full day'),
(9, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:15:00', '15:15:00', 'PRESENT', 'Full day'),
(10, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:30:00', '16:30:00', 'PRESENT', 'Full day'),
(11, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 'PRESENT', 'Full day'),
(12, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:15:00', '18:15:00', 'PRESENT', 'Full day'),
(13, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:30:00', '18:30:00', 'PRESENT', 'Full day'),
(14, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 'PRESENT', 'Full day'),
(15, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:45:00', '18:45:00', 'PRESENT', 'Full day');

-- ============================================
-- INSERT EXPENSES - CHENNAI (LAST 30 DAYS)
-- ============================================
INSERT INTO expenses (branch_id, category, amount, description, expense_date, created_by) VALUES
(1, 'INVENTORY', 15000.00, 'Monthly flour and sugar purchase', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1),
(1, 'ELECTRICITY', 8000.00, 'Monthly electricity bill', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 1),
(1, 'SALARY', 125000.00, 'Staff salaries for the month', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 1),
(1, 'TRANSPORT', 5000.00, 'Fuel and delivery vehicle maintenance', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1),
(1, 'MAINTENANCE', 3000.00, 'Oven maintenance and repair', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1),
(1, 'OTHER', 2000.00, 'Packaging materials and miscellaneous', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1);

-- ============================================
-- INSERT EXPENSES - COIMBATORE (LAST 30 DAYS)
-- ============================================
INSERT INTO expenses (branch_id, category, amount, description, expense_date, created_by) VALUES
(2, 'INVENTORY', 12000.00, 'Monthly raw material purchase', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 2),
(2, 'ELECTRICITY', 6000.00, 'Monthly electricity bill', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 2),
(2, 'SALARY', 105000.00, 'Staff salaries for the month', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 2),
(2, 'TRANSPORT', 4000.00, 'Delivery vehicle expenses', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 2),
(2, 'MAINTENANCE', 2500.00, 'Equipment maintenance', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 2);

-- ============================================
-- INSERT EXPENSES - ERODE (LAST 30 DAYS)
-- ============================================
INSERT INTO expenses (branch_id, category, amount, description, expense_date, created_by) VALUES
(3, 'INVENTORY', 10000.00, 'Monthly inventory purchase', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 3),
(3, 'ELECTRICITY', 5000.00, 'Monthly electricity bill', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 3),
(3, 'SALARY', 105000.00, 'Staff salaries for the month', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 3),
(3, 'TRANSPORT', 3500.00, 'Delivery expenses', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 3),
(3, 'MAINTENANCE', 2000.00, 'Kitchen equipment maintenance', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 3);

-- ============================================
-- INSERT BILLS AND SALES - HISTORICAL DATA (LAST 30 DAYS)
-- ============================================

-- Helper function to create bills with items
-- CHENNAI - Last 30 days sales
INSERT INTO bills (branch_id, bill_number, customer_name, subtotal, discount, tax, total_amount, payment_method, created_at) VALUES
(1, 'FB-CH-2024-001', 'Walk-in Customer', 450.00, 0.00, 0.00, 450.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(1, 'FB-CH-2024-002', 'Hotel Grand', 1200.00, 50.00, 0.00, 1150.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(1, 'FB-CH-2024-003', 'Sweet Shop', 850.00, 0.00, 0.00, 850.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(1, 'FB-CH-2024-004', 'Corporate Order', 3500.00, 200.00, 0.00, 3300.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
(1, 'FB-CH-2024-005', 'Walk-in Customer', 320.00, 0.00, 0.00, 320.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 26 DAY)),
(1, 'FB-CH-2024-006', 'Birthday Party', 2500.00, 100.00, 0.00, 2400.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(1, 'FB-CH-2024-007', 'Walk-in Customer', 280.00, 0.00, 0.00, 280.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 24 DAY)),
(1, 'FB-CH-2024-008', 'Hotel Raj', 1800.00, 80.00, 0.00, 1720.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 23 DAY)),
(1, 'FB-CH-2024-009', 'Walk-in Customer', 550.00, 0.00, 0.00, 550.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 22 DAY)),
(1, 'FB-CH-2024-010', 'Wedding Order', 5500.00, 300.00, 0.00, 5200.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 21 DAY)),
(1, 'FB-CH-2024-011', 'Walk-in Customer', 420.00, 0.00, 0.00, 420.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(1, 'FB-CH-2024-012', 'Cafe Order', 950.00, 40.00, 0.00, 910.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 19 DAY)),
(1, 'FB-CH-2024-013', 'Walk-in Customer', 380.00, 0.00, 0.00, 380.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
(1, 'FB-CH-2024-014', 'Corporate Event', 4200.00, 200.00, 0.00, 4000.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 17 DAY)),
(1, 'FB-CH-2024-015', 'Walk-in Customer', 290.00, 0.00, 0.00, 290.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 16 DAY)),
(1, 'FB-CH-2024-016', 'Hotel order', 1600.00, 70.00, 0.00, 1530.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
(1, 'FB-CH-2024-017', 'Walk-in Customer', 470.00, 0.00, 0.00, 470.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
(1, 'FB-CH-2024-018', 'Anniversary Party', 2800.00, 120.00, 0.00, 2680.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(1, 'FB-CH-2024-019', 'Walk-in Customer', 340.00, 0.00, 0.00, 340.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(1, 'FB-CH-2024-020', 'Restaurant Supply', 2100.00, 90.00, 0.00, 2010.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 11 DAY)),
(1, 'FB-CH-2024-021', 'Walk-in Customer', 510.00, 0.00, 0.00, 510.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(1, 'FB-CH-2024-022', 'Corporate Meeting', 3800.00, 180.00, 0.00, 3620.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(1, 'FB-CH-2024-023', 'Walk-in Customer', 270.00, 0.00, 0.00, 270.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
(1, 'FB-CH-2024-024', 'Hotel Order', 1450.00, 65.00, 0.00, 1385.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(1, 'FB-CH-2024-025', 'Walk-in Customer', 430.00, 0.00, 0.00, 430.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(1, 'FB-CH-2024-026', 'Birthday Celebration', 2300.00, 100.00, 0.00, 2200.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, 'FB-CH-2024-027', 'Walk-in Customer', 360.00, 0.00, 0.00, 360.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, 'FB-CH-2024-028', 'Corporate Lunch', 3200.00, 150.00, 0.00, 3050.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 'FB-CH-2024-029', 'Walk-in Customer', 490.00, 0.00, 0.00, 490.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, 'FB-CH-2024-030', 'Today Special', 1850.00, 80.00, 0.00, 1770.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 1 DAY));

-- COIMBATORE - Last 30 days sales
INSERT INTO bills (branch_id, bill_number, customer_name, subtotal, discount, tax, total_amount, payment_method, created_at) VALUES
(2, 'FB-CB-2024-001', 'Walk-in Customer', 350.00, 0.00, 0.00, 350.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(2, 'FB-CB-2024-002', 'Local Cafe', 950.00, 40.00, 0.00, 910.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(2, 'FB-CB-2024-003', 'Walk-in Customer', 280.00, 0.00, 0.00, 280.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(2, 'FB-CB-2024-004', 'Office Order', 2800.00, 120.00, 0.00, 2680.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
(2, 'FB-CB-2024-005', 'Walk-in Customer', 420.00, 0.00, 0.00, 420.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 26 DAY)),
(2, 'FB-CB-2024-006', 'Birthday Party', 2200.00, 100.00, 0.00, 2100.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(2, 'FB-CB-2024-007', 'Walk-in Customer', 310.00, 0.00, 0.00, 310.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 24 DAY)),
(2, 'FB-CB-2024-008', 'Hotel Order', 1400.00, 60.00, 0.00, 1340.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 23 DAY)),
(2, 'FB-CB-2024-009', 'Walk-in Customer', 380.00, 0.00, 0.00, 380.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 22 DAY)),
(2, 'FB-CB-2024-010', 'Wedding Order', 4800.00, 250.00, 0.00, 4550.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 21 DAY)),
(2, 'FB-CB-2024-011', 'Walk-in Customer', 290.00, 0.00, 0.00, 290.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(2, 'FB-CB-2024-012', 'Cafe Order', 850.00, 35.00, 0.00, 815.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 19 DAY)),
(2, 'FB-CB-2024-013', 'Walk-in Customer', 350.00, 0.00, 0.00, 350.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
(2, 'FB-CB-2024-014', 'Corporate Event', 3800.00, 180.00, 0.00, 3620.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 17 DAY)),
(2, 'FB-CB-2024-015', 'Walk-in Customer', 260.00, 0.00, 0.00, 260.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 16 DAY)),
(2, 'FB-CB-2024-016', 'Hotel order', 1300.00, 55.00, 0.00, 1245.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
(2, 'FB-CB-2024-017', 'Walk-in Customer', 410.00, 0.00, 0.00, 410.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
(2, 'FB-CB-2024-018', 'Anniversary Party', 2600.00, 110.00, 0.00, 2490.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(2, 'FB-CB-2024-019', 'Walk-in Customer', 320.00, 0.00, 0.00, 320.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(2, 'FB-CB-2024-020', 'Restaurant Supply', 1900.00, 80.00, 0.00, 1820.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 11 DAY)),
(2, 'FB-CB-2024-021', 'Walk-in Customer', 470.00, 0.00, 0.00, 470.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(2, 'FB-CB-2024-022', 'Corporate Meeting', 3400.00, 160.00, 0.00, 3240.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(2, 'FB-CB-2024-023', 'Walk-in Customer', 250.00, 0.00, 0.00, 250.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
(2, 'FB-CB-2024-024', 'Hotel Order', 1250.00, 55.00, 0.00, 1195.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(2, 'FB-CB-2024-025', 'Walk-in Customer', 390.00, 0.00, 0.00, 390.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(2, 'FB-CB-2024-026', 'Birthday Celebration', 2100.00, 90.00, 0.00, 2010.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(2, 'FB-CB-2024-027', 'Walk-in Customer', 330.00, 0.00, 0.00, 330.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(2, 'FB-CB-2024-028', 'Corporate Lunch', 2900.00, 130.00, 0.00, 2770.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(2, 'FB-CB-2024-029', 'Walk-in Customer', 450.00, 0.00, 0.00, 450.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(2, 'FB-CB-2024-030', 'Today Special', 1650.00, 70.00, 0.00, 1580.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 1 DAY));

-- ERODE - Last 30 days sales
INSERT INTO bills (branch_id, bill_number, customer_name, subtotal, discount, tax, total_amount, payment_method, created_at) VALUES
(3, 'FB-ER-2024-001', 'Walk-in Customer', 280.00, 0.00, 0.00, 280.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(3, 'FB-ER-2024-002', 'Local Shop', 750.00, 30.00, 0.00, 720.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(3, 'FB-ER-2024-003', 'Walk-in Customer', 220.00, 0.00, 0.00, 220.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(3, 'FB-ER-2024-004', 'Office Order', 2200.00, 100.00, 0.00, 2100.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
(3, 'FB-ER-2024-005', 'Walk-in Customer', 350.00, 0.00, 0.00, 350.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 26 DAY)),
(3, 'FB-ER-2024-006', 'Birthday Party', 1800.00, 80.00, 0.00, 1720.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(3, 'FB-ER-2024-007', 'Walk-in Customer', 260.00, 0.00, 0.00, 260.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 24 DAY)),
(3, 'FB-ER-2024-008', 'Hotel Order', 1100.00, 50.00, 0.00, 1050.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 23 DAY)),
(3, 'FB-ER-2024-009', 'Walk-in Customer', 310.00, 0.00, 0.00, 310.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 22 DAY)),
(3, 'FB-ER-2024-010', 'Wedding Order', 4000.00, 200.00, 0.00, 3800.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 21 DAY)),
(3, 'FB-ER-2024-011', 'Walk-in Customer', 240.00, 0.00, 0.00, 240.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(3, 'FB-ER-2024-012', 'Cafe Order', 700.00, 30.00, 0.00, 670.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 19 DAY)),
(3, 'FB-ER-2024-013', 'Walk-in Customer', 280.00, 0.00, 0.00, 280.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
(3, 'FB-ER-2024-014', 'Corporate Event', 3200.00, 150.00, 0.00, 3050.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 17 DAY)),
(3, 'FB-ER-2024-015', 'Walk-in Customer', 210.00, 0.00, 0.00, 210.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 16 DAY)),
(3, 'FB-ER-2024-016', 'Hotel order', 1000.00, 45.00, 0.00, 955.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
(3, 'FB-ER-2024-017', 'Walk-in Customer', 350.00, 0.00, 0.00, 350.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
(3, 'FB-ER-2024-018', 'Anniversary Party', 2200.00, 100.00, 0.00, 2100.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(3, 'FB-ER-2024-019', 'Walk-in Customer', 280.00, 0.00, 0.00, 280.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(3, 'FB-ER-2024-020', 'Restaurant Supply', 1500.00, 65.00, 0.00, 1435.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 11 DAY)),
(3, 'FB-ER-2024-021', 'Walk-in Customer', 390.00, 0.00, 0.00, 390.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(3, 'FB-ER-2024-022', 'Corporate Meeting', 2800.00, 130.00, 0.00, 2670.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(3, 'FB-ER-2024-023', 'Walk-in Customer', 220.00, 0.00, 0.00, 220.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
(3, 'FB-ER-2024-024', 'Hotel Order', 950.00, 40.00, 0.00, 910.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(3, 'FB-ER-2024-025', 'Walk-in Customer', 330.00, 0.00, 0.00, 330.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(3, 'FB-ER-2024-026', 'Birthday Celebration', 1900.00, 80.00, 0.00, 1820.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(3, 'FB-ER-2024-027', 'Walk-in Customer', 270.00, 0.00, 0.00, 270.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(3, 'FB-ER-2024-028', 'Corporate Lunch', 2400.00, 110.00, 0.00, 2290.00, 'CARD', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(3, 'FB-ER-2024-029', 'Walk-in Customer', 390.00, 0.00, 0.00, 390.00, 'CASH', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(3, 'FB-ER-2024-030', 'Today Special', 1400.00, 60.00, 0.00, 1340.00, 'UPI', DATE_SUB(CURDATE(), INTERVAL 1 DAY));

-- ============================================
-- INSERT BILL ITEMS FOR SAMPLE BILLS
-- ============================================
-- First few bills with items
INSERT INTO bill_items (bill_id, product_name, quantity, price, total) VALUES
(1, 'Bread', 10, 45.00, 450.00),
(2, 'Chocolate Cake', 1, 650.00, 650.00),
(2, 'Veg Puff', 10, 30.00, 300.00),
(2, 'Bread', 5, 45.00, 225.00),
(3, 'Chocolate Cake', 1, 650.00, 650.00),
(3, 'Veg Puff', 5, 30.00, 150.00),
(3, 'Donut', 5, 40.00, 200.00);

-- ============================================
-- INSERT SALES RECORDS (matching bills)
-- ============================================
INSERT INTO sales (branch_id, bill_id, product_name, quantity, amount, sale_date) VALUES
(1, 1, 'Bread', 10, 450.00, DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(1, 2, 'Chocolate Cake', 1, 650.00, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(1, 2, 'Veg Puff', 10, 300.00, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(1, 2, 'Bread', 5, 225.00, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(1, 3, 'Chocolate Cake', 1, 650.00, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(1, 3, 'Veg Puff', 5, 150.00, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(1, 3, 'Donut', 5, 200.00, DATE_SUB(CURDATE(), INTERVAL 28 DAY));

-- ============================================
-- INSERT LOGISTICS
-- ============================================
INSERT INTO logistics (branch_id, item_name, source, destination, quantity, unit, status, expected_date, notes) VALUES
(1, 'Cake Boxes', 'Central Warehouse', 'Chennai Branch', 500.00, 'pieces', 'DELIVERED', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Packaging materials delivered'),
(1, 'Flour', 'Local Mill', 'Chennai Branch', 200.00, 'kg', 'IN_TRANSIT', CURDATE(), 'Flour delivery in progress'),
(2, 'Sugar', 'Sugar Suppliers', 'Coimbatore Branch', 150.00, 'kg', 'PENDING', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Sugar order placed'),
(2, 'Eggs', 'Poultry Farm', 'Coimbatore Branch', 300.00, 'pieces', 'DELIVERED', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Fresh eggs delivered'),
(3, 'Butter', 'Dairy Farm', 'Erode Branch', 100.00, 'kg', 'IN_TRANSIT', CURDATE(), 'Butter delivery in progress'),
(3, 'Packaging Boxes', 'Packaging Co', 'Erode Branch', 400.00, 'pieces', 'PENDING', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Packaging order placed');

-- ============================================
-- INSERT NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, branch_id, type, title, message, is_read) VALUES
(2, 1, 'LOW_STOCK', 'Low Stock Alert', 'Wheat Flour is running low (500kg remaining)', FALSE),
(3, 2, 'LOW_STOCK', 'Low Stock Alert', 'Sugar is running low (250kg remaining)', FALSE),
(4, 3, 'LOW_STOCK', 'Low Stock Alert', 'Butter is running low (100kg remaining)', FALSE),
(1, 1, 'TASK_OVERDUE', 'Task Overdue', 'Task "Prepare 100 bread loaves" is overdue', FALSE),
(2, 1, 'NEW_TASK', 'New Task Assigned', 'You have been assigned a new task: "Pack 50 pastry boxes"', FALSE),
(6, 2, 'NEW_TASK', 'New Task Assigned', 'You have been assigned a new task: "Load delivery orders"', FALSE),
(11, 3, 'NEW_TASK', 'New Task Assigned', 'You have been assigned a new task: "Prepare special orders"', FALSE);

-- ============================================
-- INSERT AI PREDICTIONS (SAMPLE)
-- ============================================
INSERT INTO ai_predictions (branch_id, prediction_type, item_name, current_value, predicted_value, prediction_date, confidence_level, recommendation) VALUES
(1, 'INVENTORY_DEMAND', 'Wheat Flour', 500.00, 450.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 85.00, 'Consider ordering 200kg more flour within next 5 days'),
(1, 'SALES_TREND', NULL, 1850.00, 2100.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 75.00, 'Sales expected to increase by 15% next week'),
(2, 'INVENTORY_DEMAND', 'Sugar', 250.00, 200.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 80.00, 'Sugar consumption expected to increase, order 100kg more'),
(3, 'PRODUCTIVITY', NULL, 85.00, 88.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 70.00, 'Worker productivity expected to improve slightly');

-- ============================================
-- INSERT AI ANOMALIES (SAMPLE)
-- ============================================
INSERT INTO ai_anomalies (branch_id, anomaly_type, description, severity, status, notes) VALUES
(1, 'INVENTORY', 'Unusual consumption of flour detected - 30% higher than average', 'MEDIUM', 'OPEN', 'Investigate possible wastage or increased production'),
(2, 'SALES', 'Sudden drop in sales on 2024-08-25 - 40% below average', 'HIGH', 'OPEN', 'Check for external factors or operational issues'),
(3, 'BILLING', 'Multiple high-value orders detected in single day', 'LOW', 'REVIEWED', 'Verified as legitimate corporate orders');

-- ============================================
-- SEED DATA COMPLETED
-- ============================================
SELECT 'FreshBake Foods bakery seed data loaded successfully!' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_organizations FROM organizations;
SELECT COUNT(*) AS total_branches FROM branches;
SELECT COUNT(*) AS total_admins FROM admins;
SELECT COUNT(*) AS total_workers FROM workers;
SELECT COUNT(*) AS total_tasks FROM tasks;
SELECT COUNT(*) AS total_attendance FROM attendance;
SELECT COUNT(*) AS total_inventory FROM inventory;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_bills FROM bills;
SELECT COUNT(*) AS total_sales FROM sales;
SELECT COUNT(*) AS total_expenses FROM expenses;
SELECT COUNT(*) AS total_logistics FROM logistics;
SELECT COUNT(*) AS total_notifications FROM notifications;

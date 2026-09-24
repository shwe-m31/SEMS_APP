-- SIMPLE SEED DATA FOR SEMS
-- This file creates minimal essential data for testing

USE sems_db;

-- ============================================
-- INSERT ESSENTIAL USERS
-- ============================================

-- Delete existing test users to avoid conflicts
DELETE FROM users WHERE email IN ('owner@freshbake.com', 'manager.chennai@freshbake.com', 'manager.coimbatore@freshbake.com', 'manager.erode@freshbake.com', 'ravi.chennai@freshbake.com');

-- INSERT OWNER USER
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('owner@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mohanraj', '+91-9876543210', '1975-03-15', 'MALE', 'OWNER')
ON DUPLICATE KEY UPDATE name='Mohanraj';

-- INSERT ORGANIZATION
INSERT INTO organizations (owner_id, name, type, industry_type, has_branches) VALUES
(1, 'FreshBake Foods', 'MEDIUM', 'FOOD_RETAIL', TRUE)
ON DUPLICATE KEY UPDATE name='FreshBake Foods';

-- INSERT BRANCHES
INSERT INTO branches (organization_id, name, location, address, phone) VALUES
(1, 'FreshBake Central Bakery', 'Chennai', '123 Bakery Street, Anna Nagar, Chennai', '+91-44-23456789')
ON DUPLICATE KEY UPDATE name='FreshBake Central Bakery';

-- INSERT MANAGER USER
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('manager.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Priya', '+91-9876543211', '1985-08-20', 'FEMALE', 'ADMIN')
ON DUPLICATE KEY UPDATE name='Priya';

-- INSERT ADMIN (Manager) mapping to branch
INSERT INTO admins (user_id, branch_id, designation, temporary_password) VALUES
(2, 1, 'Branch Manager', 'password')
ON DUPLICATE KEY UPDATE designation='Branch Manager';

-- INSERT WORKER USER
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('ravi.chennai@freshbake.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ravi Kumar', '+91-9876543221', '1990-06-15', 'MALE', 'WORKER')
ON DUPLICATE KEY UPDATE name='Ravi Kumar';

-- INSERT WORKER mapping to branch
INSERT INTO workers (user_id, branch_id, employee_id, designation, salary, hire_date, status) VALUES
(3, 1, 'FB-CH-001', 'Baker', 25000.00, '2023-01-15', 'ACTIVE')
ON DUPLICATE KEY UPDATE designation='Baker';

-- ============================================
-- INSERT BASIC INVENTORY
-- ============================================
INSERT INTO inventory (branch_id, name, category, quantity, unit, minimum_stock_level, supplier) VALUES
(1, 'Wheat Flour', 'RAW_MATERIAL', 500.00, 'kg', 100.00, 'Local Mill')
ON DUPLICATE KEY UPDATE quantity=500.00;

INSERT INTO inventory (branch_id, name, category, quantity, unit, minimum_stock_level, supplier) VALUES
(1, 'Sugar', 'RAW_MATERIAL', 300.00, 'kg', 50.00, 'Sugar Suppliers Ltd')
ON DUPLICATE KEY UPDATE quantity=300.00;

-- ============================================
-- INSERT BASIC PRODUCTS
-- ============================================
INSERT INTO products (branch_id, name, category, price, description) VALUES
(1, 'Bread', 'Bakery', 45.00, 'Fresh daily bread')
ON DUPLICATE KEY UPDATE price=45.00;

INSERT INTO products (branch_id, name, category, price, description) VALUES
(1, 'Chocolate Cake', 'Cakes', 650.00, 'Rich chocolate cake')
ON DUPLICATE KEY UPDATE price=650.00;

-- ============================================
-- INSERT BASIC TASKS
-- ============================================
INSERT INTO tasks (branch_id, assigned_to, assigned_by, title, description, priority, status, due_date) VALUES
(1, 1, 1, 'Prepare bread batch', 'Bake 50 loaves of bread for morning delivery', 'HIGH', 'PENDING', CURDATE())
ON DUPLICATE KEY UPDATE title='Prepare bread batch';

-- ============================================
-- INSERT BASIC ATTENDANCE
-- ============================================
INSERT INTO attendance (worker_id, branch_id, date, check_in_time, check_out_time, status, notes) VALUES
(1, 1, CURDATE(), '06:00:00', NULL, 'PRESENT', 'On time')
ON DUPLICATE KEY UPDATE status='PRESENT';

-- ============================================
-- INSERT BASIC SHIFTS
-- ============================================
INSERT INTO shifts (branch_id, name, start_time, end_time, description) VALUES
(1, 'Morning Shift', '06:00:00', '14:00:00', 'Early morning baking shift')
ON DUPLICATE KEY UPDATE name='Morning Shift';

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Users created:' as message, COUNT(*) as count FROM users;
SELECT email, name, role FROM users ORDER BY id;
SELECT 'Organization created:' as message, COUNT(*) as count FROM organizations;
SELECT 'Branches created:' as message, COUNT(*) as count FROM branches;
SELECT 'Workers created:' as message, COUNT(*) as count FROM workers;
SELECT 'Admins created:' as message, COUNT(*) as count FROM admins;
SELECT 'Tasks created:' as message, COUNT(*) as count FROM tasks;
SELECT 'Inventory items created:' as message, COUNT(*) as count FROM inventory;
SELECT 'Products created:' as message, COUNT(*) as count FROM products;

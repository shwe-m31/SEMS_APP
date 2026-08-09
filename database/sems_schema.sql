-- SMART ENTERPRISE MANAGEMENT SYSTEM (SEMS)
-- Database Schema for MySQL
-- Version: 1.0

-- Create Database
CREATE DATABASE IF NOT EXISTS sems_db;
USE sems_db;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    role ENUM('OWNER', 'ADMIN', 'WORKER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('SMALL', 'MEDIUM', 'LARGE') NOT NULL,
    industry_type ENUM('FOOD_RETAIL', 'TEXTILE_FABRIC', 'MANUFACTURING', 'WAREHOUSE_DISTRIBUTION', 'OTHER_MSME') NOT NULL,
    has_branches BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id)
);

-- ============================================
-- BRANCHES TABLE
-- ============================================
CREATE TABLE branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_organization (organization_id)
);

-- ============================================
-- WORKERS TABLE
-- ============================================
CREATE TABLE workers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    designation VARCHAR(100),
    salary DECIMAL(10, 2),
    hire_date DATE,
    status ENUM('ACTIVE', 'INACTIVE', 'TERMINATED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_branch (branch_id)
);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    designation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_branch (branch_id)
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    assigned_to BIGINT,
    assigned_by BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE') DEFAULT 'PENDING',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES workers(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status)
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY') DEFAULT 'PRESENT',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (worker_id, date),
    INDEX idx_worker (worker_id),
    INDEX idx_date (date)
);

-- ============================================
-- SHIFTS TABLE
-- ============================================
CREATE TABLE shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id)
);

-- ============================================
-- WORKER SHIFTS TABLE
-- ============================================
CREATE TABLE worker_shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    shift_id BIGINT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    INDEX idx_worker (worker_id),
    INDEX idx_date (date)
);

-- ============================================
-- INVENTORY TABLE
-- ============================================
CREATE TABLE inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('PRODUCT', 'RAW_MATERIAL', 'FINISHED_GOOD', 'SUPPLY') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    minimum_stock_level DECIMAL(10, 2) DEFAULT 10,
    supplier VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id),
    INDEX idx_category (category)
);

-- ============================================
-- INVENTORY TRANSACTIONS TABLE
-- ============================================
CREATE TABLE inventory_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    transaction_type ENUM('ADD', 'REMOVE', 'UPDATE') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    previous_quantity DECIMAL(10, 2),
    new_quantity DECIMAL(10, 2),
    notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_inventory (inventory_id),
    INDEX idx_date (created_at)
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id)
);

-- ============================================
-- BILLS TABLE
-- ============================================
CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id),
    INDEX idx_date (created_at)
);

-- ============================================
-- BILL ITEMS TABLE
-- ============================================
CREATE TABLE bill_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    INDEX idx_bill (bill_id)
);

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE sales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    bill_id BIGINT,
    product_id BIGINT,
    product_name VARCHAR(255),
    quantity DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    sale_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL,
    INDEX idx_branch (branch_id),
    INDEX idx_date (sale_date)
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    category ENUM('INVENTORY', 'SALARY', 'TRANSPORT', 'ELECTRICITY', 'MAINTENANCE', 'OTHER') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id),
    INDEX idx_date (expense_date),
    INDEX idx_category (category)
);

-- ============================================
-- LOGISTICS TABLE
-- ============================================
CREATE TABLE logistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    source VARCHAR(255),
    destination VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50),
    status ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED') DEFAULT 'PENDING',
    expected_date DATE,
    actual_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id),
    INDEX idx_status (status)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    branch_id BIGINT,
    type ENUM('LOW_STOCK', 'CRITICAL_STOCK', 'NEW_TASK', 'TASK_OVERDUE', 'ATTENDANCE_ISSUE', 'BILLING_UPDATE', 'AI_ANOMALY', 'AI_DEMAND_WARNING', 'OTHER') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read)
);

-- ============================================
-- AI PREDICTIONS TABLE
-- ============================================
CREATE TABLE ai_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    prediction_type ENUM('INVENTORY_DEMAND', 'SALES_TREND', 'PRODUCTIVITY') NOT NULL,
    item_name VARCHAR(255),
    current_value DECIMAL(10, 2),
    predicted_value DECIMAL(10, 2),
    prediction_date DATE NOT NULL,
    confidence_level DECIMAL(5, 2),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id),
    INDEX idx_type (prediction_type),
    INDEX idx_date (prediction_date)
);

-- ============================================
-- AI ANOMALIES TABLE
-- ============================================
CREATE TABLE ai_anomalies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    anomaly_type ENUM('INVENTORY', 'SALES', 'BILLING', 'STOCK_UPDATE') NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('OPEN', 'REVIEWED', 'RESOLVED') DEFAULT 'OPEN',
    notes TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_branch (branch_id),
    INDEX idx_status (status)
);

-- ============================================
-- SAMPLE / DEMO DATA INSERTION
-- ============================================

-- Insert Owner User
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('owner@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rajesh Kumar', '+91-9876543210', '1980-05-15', 'MALE', 'OWNER');

-- Insert Organization
INSERT INTO organizations (owner_id, name, type, industry_type, has_branches) VALUES
(1, 'Kumar Enterprises', 'MEDIUM', 'MANUFACTURING', TRUE);

-- Insert Branches
INSERT INTO branches (organization_id, name, location, address, phone) VALUES
(1, 'Branch 1 - Main Unit', 'Mumbai', '123 Industrial Area, Mumbai', '+91-1234567890'),
(1, 'Branch 2 - Production Unit', 'Pune', '456 Manufacturing Zone, Pune', '+91-2345678901'),
(1, 'Branch 3 - Distribution Center', 'Nashik', '789 Logistics Park, Nashik', '+91-3456789012');

-- Insert Admin Users
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('admin1@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Amit Sharma', '+91-8765432109', '1985-08-20', 'MALE', 'ADMIN'),
('admin2@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Priya Singh', '+91-7654321098', '1987-12-10', 'FEMALE', 'ADMIN'),
('admin3@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vikram Patel', '+91-6543210987', '1986-03-25', 'MALE', 'ADMIN');

-- Insert Admins mapping to branches
INSERT INTO admins (user_id, branch_id, designation) VALUES
(2, 1, 'Branch Manager'),
(3, 2, 'Production Manager'),
(4, 3, 'Distribution Manager');

-- Insert Worker Users
INSERT INTO users (email, password, name, phone, date_of_birth, gender, role) VALUES
('worker1@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rahul Verma', '+91-1111111111', '1995-06-15', 'MALE', 'WORKER'),
('worker2@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sneha Reddy', '+91-2222222222', '1996-09-20', 'FEMALE', 'WORKER'),
('worker3@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Amit Kumar', '+91-3333333333', '1994-04-10', 'MALE', 'WORKER'),
('worker4@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Pooja Sharma', '+91-4444444444', '1997-11-25', 'FEMALE', 'WORKER'),
('worker5@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Suresh Yadav', '+91-5555555555', '1993-02-18', 'MALE', 'WORKER'),
('worker6@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Neha Gupta', '+91-6666666666', '1998-07-30', 'FEMALE', 'WORKER'),
('worker7@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vijay Singh', '+91-7777777777', '1992-10-05', 'MALE', 'WORKER'),
('worker8@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Anjali Mehta', '+91-8888888888', '1996-01-12', 'FEMALE', 'WORKER'),
('worker9@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rajesh Tiwari', '+91-9999999999', '1994-08-22', 'MALE', 'WORKER'),
('worker10@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kavita Joshi', '+91-1010101010', '1995-03-08', 'FEMALE', 'WORKER'),
('worker11@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Deepak Kumar', '+91-1212121212', '1993-12-15', 'MALE', 'WORKER'),
('worker12@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sunita Rao', '+91-1313131313', '1997-05-28', 'FEMALE', 'WORKER'),
('worker13@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mohan Das', '+91-1414141414', '1992-09-10', 'MALE', 'WORKER'),
('worker14@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lakshmi Devi', '+91-1515151515', '1996-06-20', 'FEMALE', 'WORKER'),
('worker15@sems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sunil Kumar', '+91-1616161616', '1994-11-30', 'MALE', 'WORKER');

-- Insert Workers mapping to branches
INSERT INTO workers (user_id, branch_id, employee_id, designation, salary, hire_date, status) VALUES
(5, 1, 'EMP001', 'Machine Operator', 25000.00, '2023-01-15', 'ACTIVE'),
(6, 1, 'EMP002', 'Quality Checker', 22000.00, '2023-02-01', 'ACTIVE'),
(7, 1, 'EMP003', 'Packaging Staff', 20000.00, '2023-03-10', 'ACTIVE'),
(8, 1, 'EMP004', 'Assembly Worker', 21000.00, '2023-04-05', 'ACTIVE'),
(9, 1, 'EMP005', 'Maintenance Staff', 23000.00, '2023-05-20', 'ACTIVE'),
(10, 2, 'EMP006', 'Production Supervisor', 28000.00, '2023-01-20', 'ACTIVE'),
(11, 2, 'EMP007', 'Machine Operator', 25000.00, '2023-02-15', 'ACTIVE'),
(12, 2, 'EMP008', 'Quality Inspector', 24000.00, '2023-03-25', 'ACTIVE'),
(13, 2, 'EMP009', 'Raw Material Handler', 22000.00, '2023-04-10', 'ACTIVE'),
(14, 2, 'EMP010', 'Finishing Staff', 21000.00, '2023-05-15', 'ACTIVE'),
(15, 3, 'EMP011', 'Warehouse Manager', 30000.00, '2023-01-10', 'ACTIVE'),
(16, 3, 'EMP012', 'Logistics Coordinator', 26000.00, '2023-02-20', 'ACTIVE'),
(17, 3, 'EMP013', 'Inventory Clerk', 22000.00, '2023-03-30', 'ACTIVE'),
(18, 3, 'EMP014', 'Delivery Staff', 20000.00, '2023-04-15', 'ACTIVE'),
(19, 3, 'EMP015', 'Packaging Assistant', 19000.00, '2023-05-25', 'ACTIVE');

-- Insert Shifts
INSERT INTO shifts (branch_id, name, start_time, end_time, description) VALUES
(1, 'Morning Shift', '06:00:00', '14:00:00', 'Early morning production shift'),
(1, 'Afternoon Shift', '14:00:00', '22:00:00', 'Afternoon production shift'),
(2, 'Morning Shift', '07:00:00', '15:00:00', 'Morning production shift'),
(2, 'Evening Shift', '15:00:00', '23:00:00', 'Evening production shift'),
(3, 'Day Shift', '09:00:00', '18:00:00', 'Regular warehouse operations');

-- Insert Sample Products
INSERT INTO products (branch_id, name, category, price, description) VALUES
(1, 'Steel Sheet A', 'Raw Material', 5000.00, 'Industrial grade steel sheet'),
(1, 'Plastic Component X', 'Component', 150.00, 'Plastic component for assembly'),
(1, 'Finished Product Model 1', 'Finished Good', 12000.00, 'Main finished product'),
(2, 'Copper Wire', 'Raw Material', 800.00, 'Copper wire for production'),
(2, 'Electronic Board', 'Component', 2500.00, 'Electronic control board'),
(2, 'Finished Product Model 2', 'Finished Good', 15000.00, 'Advanced finished product'),
(3, 'Packaging Box', 'Supply', 50.00, 'Standard packaging box'),
(3, 'Label Sticker', 'Supply', 5.00, 'Product label sticker');

-- Insert Sample Inventory
INSERT INTO inventory (branch_id, name, category, quantity, unit, minimum_stock_level, supplier) VALUES
(1, 'Steel Sheet A', 'RAW_MATERIAL', 150.00, 'sheets', 50, 'Steel Suppliers Ltd'),
(1, 'Plastic Component X', 'RAW_MATERIAL', 500.00, 'units', 100, 'Plastic Corp'),
(1, 'Finished Product Model 1', 'FINISHED_GOOD', 45.00, 'units', 20, 'In-house'),
(2, 'Copper Wire', 'RAW_MATERIAL', 200.00, 'meters', 50, 'Copper Industries'),
(2, 'Electronic Board', 'RAW_MATERIAL', 80.00, 'units', 30, 'Electronics Plus'),
(2, 'Finished Product Model 2', 'FINISHED_GOOD', 30.00, 'units', 15, 'In-house'),
(3, 'Packaging Box', 'SUPPLY', 1000.00, 'units', 200, 'Packaging Solutions'),
(3, 'Label Sticker', 'SUPPLY', 5000.00, 'units', 1000, 'Label Printers');

-- Insert Sample Tasks
INSERT INTO tasks (branch_id, assigned_to, assigned_by, title, description, priority, status, due_date) VALUES
(1, 1, 1, 'Machine Maintenance', 'Perform routine maintenance on Machine A', 'HIGH', 'IN_PROGRESS', '2024-08-15'),
(1, 2, 1, 'Quality Check Batch 25', 'Inspect and approve Batch 25 products', 'MEDIUM', 'COMPLETED', '2024-08-12'),
(2, 6, 2, 'Production Target 100', 'Complete production of 100 units', 'HIGH', 'PENDING', '2024-08-16'),
(2, 7, 2, 'Raw Material Inventory', 'Update raw material inventory records', 'LOW', 'PENDING', '2024-08-18'),
(3, 11, 3, 'Dispatch Order #456', 'Prepare and dispatch customer order #456', 'URGENT', 'IN_PROGRESS', '2024-08-14');

-- Insert Sample Attendance (Today)
INSERT INTO attendance (worker_id, branch_id, date, check_in_time, check_out_time, status) VALUES
(1, 1, CURDATE(), '06:15:00', '14:00:00', 'PRESENT'),
(2, 1, CURDATE(), '06:30:00', '14:00:00', 'PRESENT'),
(3, 1, CURDATE(), '06:45:00', '14:00:00', 'LATE'),
(4, 1, CURDATE(), NULL, NULL, 'ABSENT'),
(5, 1, CURDATE(), '06:00:00', '14:00:00', 'PRESENT'),
(6, 2, CURDATE(), '07:10:00', '15:00:00', 'PRESENT'),
(7, 2, CURDATE(), '07:00:00', '15:00:00', 'PRESENT'),
(8, 2, CURDATE(), '07:30:00', '15:00:00', 'LATE'),
(9, 2, CURDATE(), '07:15:00', '15:00:00', 'PRESENT'),
(10, 2, CURDATE(), NULL, NULL, 'ABSENT'),
(11, 3, CURDATE(), '09:00:00', '18:00:00', 'PRESENT'),
(12, 3, CURDATE(), '09:15:00', '18:00:00', 'PRESENT'),
(13, 3, CURDATE(), '09:30:00', '18:00:00', 'LATE'),
(14, 3, CURDATE(), '09:00:00', '18:00:00', 'PRESENT'),
(15, 3, CURDATE(), '09:00:00', '18:00:00', 'PRESENT');

-- Insert Sample Bills
INSERT INTO bills (branch_id, bill_number, customer_name, subtotal, discount, tax, total_amount, payment_method, created_by) VALUES
(1, 'BILL-2024-001', 'ABC Manufacturing', 35000.00, 2000.00, 3150.00, 36150.00, 'BANK_TRANSFER', 1),
(1, 'BILL-2024-002', 'XYZ Industries', 12000.00, 0.00, 1080.00, 13080.00, 'CASH', 1),
(2, 'BILL-2024-003', 'Tech Solutions', 45000.00, 3000.00, 3780.00, 45780.00, 'BANK_TRANSFER', 2),
(2, 'BILL-2024-004', 'Global Corp', 30000.00, 1500.00, 2475.00, 30975.00, 'CASH', 2),
(3, 'BILL-2024-005', 'Retail Store A', 5000.00, 0.00, 450.00, 5450.00, 'CASH', 3);

-- Insert Sample Sales
INSERT INTO sales (branch_id, bill_id, product_name, quantity, amount, sale_date) VALUES
(1, 1, 'Finished Product Model 1', 3.00, 36150.00, CURDATE()),
(1, 2, 'Finished Product Model 1', 1.00, 13080.00, CURDATE()),
(2, 3, 'Finished Product Model 2', 3.00, 45780.00, CURDATE()),
(2, 4, 'Finished Product Model 2', 2.00, 30975.00, CURDATE()),
(3, 5, 'Packaging Box', 100.00, 5450.00, CURDATE());

-- Insert Sample Expenses
INSERT INTO expenses (branch_id, category, amount, description, expense_date, created_by) VALUES
(1, 'ELECTRICITY', 15000.00, 'Monthly electricity bill', CURDATE(), 1),
(1, 'MAINTENANCE', 5000.00, 'Machine repair costs', CURDATE(), 1),
(2, 'INVENTORY', 25000.00, 'Raw material purchase', CURDATE(), 2),
(2, 'TRANSPORT', 8000.00, 'Material transportation', CURDATE(), 2),
(3, 'SALARY', 150000.00, 'Monthly staff salaries', CURDATE(), 3),
(3, 'MAINTENANCE', 3000.00, 'Warehouse maintenance', CURDATE(), 3);

-- Insert Sample Logistics
INSERT INTO logistics (branch_id, item_name, source, destination, quantity, unit, status, expected_date) VALUES
(1, 'Steel Sheet A', 'Steel Suppliers Ltd', 'Branch 2', 50.00, 'sheets', 'IN_TRANSIT', '2024-08-16'),
(2, 'Copper Wire', 'Copper Industries', 'Branch 1', 100.00, 'meters', 'PENDING', '2024-08-17'),
(3, 'Finished Product Model 1', 'Branch 1', 'Customer Warehouse', 10.00, 'units', 'DELIVERED', '2024-08-13');

-- Insert Sample AI Predictions
INSERT INTO ai_predictions (branch_id, prediction_type, item_name, current_value, predicted_value, prediction_date, confidence_level, recommendation) VALUES
(1, 'INVENTORY_DEMAND', 'Steel Sheet A', 150.00, 200.00, '2024-08-16', 75.00, 'Expected demand may exceed current stock. Consider restocking.'),
(2, 'SALES_TREND', NULL, 76755.00, 85000.00, '2024-08-16', 70.00, 'Sales trend is increasing. Expected growth next week.'),
(3, 'PRODUCTIVITY', NULL, 85.00, 82.00, '2024-08-16', 65.00, 'Task completion has decreased compared with previous weeks.');

-- Insert Sample AI Anomalies
INSERT INTO ai_anomalies (branch_id, anomaly_type, description, severity, status) VALUES
(1, 'SALES', 'Unusual sales activity detected: 120 units sold in a day (normal: 20-30)', 'HIGH', 'OPEN'),
(2, 'INVENTORY', 'Rapid inventory depletion of Copper Wire - 50% drop in 2 days', 'MEDIUM', 'OPEN'),
(3, 'BILLING', 'Multiple bills with unusually high discounts detected', 'LOW', 'OPEN');

-- Insert Sample Notifications
INSERT INTO notifications (user_id, branch_id, type, title, message, is_read) VALUES
(1, NULL, 'AI_ANOMALY', 'Sales Anomaly Detected', 'Unusual sales activity detected at Branch 1. Please review.', FALSE),
(2, 1, 'LOW_STOCK', 'Low Stock Alert', 'Steel Sheet A is running low. Current stock: 150 units', FALSE),
(5, 1, 'NEW_TASK', 'New Task Assigned', 'You have been assigned a new task: Machine Maintenance', FALSE),
(6, 1, 'TASK_OVERDUE', 'Task Overdue', 'Task "Quality Check Batch 25" is overdue', FALSE);

-- Note: Default password for all demo users is "password123" (BCrypt hashed)

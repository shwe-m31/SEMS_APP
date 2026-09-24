-- Migration Script for SEMS v2.0
-- Adds support for username, must_change_password, branch_code, category and location fields

USE sems_db;

-- 1. USERS TABLE
ALTER TABLE users 
    ADD COLUMN username VARCHAR(100) UNIQUE AFTER id,
    ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE AFTER role;

-- Backfill username for any existing users without a username
UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL;

-- 2. BRANCHES TABLE
ALTER TABLE branches 
    ADD COLUMN branch_code VARCHAR(50) UNIQUE AFTER organization_id,
    ADD COLUMN state VARCHAR(100) AFTER name,
    ADD COLUMN city VARCHAR(100) AFTER state,
    ADD COLUMN pincode VARCHAR(20) AFTER city,
    ADD COLUMN category VARCHAR(100) AFTER pincode,
    ADD COLUMN organization_type VARCHAR(100) AFTER category;

-- 3. ORGANIZATIONS TABLE
ALTER TABLE organizations 
    ADD COLUMN category VARCHAR(100) AFTER industry_type,
    ADD COLUMN sub_category VARCHAR(100) AFTER category;

-- 4. ADMINS TABLE
ALTER TABLE admins 
    ADD COLUMN temporary_password VARCHAR(255) AFTER designation;


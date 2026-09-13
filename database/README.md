# Database Setup Guide

## SEMS Database Configuration

### Prerequisites
- MySQL Server installed and running
- MySQL command line client or MySQL Workbench
- Database credentials with CREATE DATABASE privileges

### Quick Setup

#### ⚡ RECOMMENDED: Simple Seed Data (Quick Start)
If you're having trouble loading the full seed data, use the simple version:

**Windows Users:**
1. Double-click `load_simple_seed.bat` in the database folder
2. Or run it manually:
   ```cmd
   cd database
   load_simple_seed.bat
   ```

**Manual Execution:**
```sql
-- In MySQL Workbench or command line:
USE sems_db;
source C:/Users/shwet/Desktop/SEMS_APP/database/simple_seed.sql;
```

This creates minimal essential data:
- 1 Owner, 1 Manager, 1 Worker
- 1 Branch, 1 Organization
- Basic inventory, products, tasks, attendance, shifts

#### Option 1: Using MySQL Command Line (Full Data)
```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Create database (if not exists)
CREATE DATABASE IF NOT EXISTS sems_db;

# 3. Use the database
USE sems_db;

# 4. Run the schema file
source C:/Users/shwet/Desktop/SEMS_APP/database/sems_schema.sql;

# 5. Run the bakery seed data
source C:/Users/shwet/Desktop/SEMS_APP/database/sems_bakery_seed.sql;

# 6. Verify data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM branches;
SELECT COUNT(*) FROM workers;
```

#### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the SQL editor
4. Execute the commands from `sems_schema.sql`
5. Execute the commands from `sems_bakery_seed.sql`

#### Option 3: Using Command Line (Single File)
```bash
# Run both schema and seed data
mysql -u root -p < C:/Users/shwet/Desktop/SEMS_APP/database/sems_schema.sql
mysql -u root -p sems_db < C:/Users/shwet/Desktop/SEMS_APP/database/sems_bakery_seed.sql
```

### Database Credentials

The default credentials in `application.properties`:
- **URL**: jdbc:mysql://localhost:3306/sems_db
- **Username**: root
- **Password**: Sql@3306

**IMPORTANT**: Update these credentials in:
- `backend/src/main/resources/application.properties`
- Environment variables for production deployment

### Seed Data Overview

The `sems_bakery_seed.sql` file creates:

#### Organization
- **Name**: FreshBake Foods
- **Type**: MEDIUM
- **Industry**: FOOD_RETAIL

#### Branches (3)
1. FreshBake Central Bakery - Chennai
2. FreshBake Coimbatore - Coimbatore
3. FreshBake Erode - Erode

#### Users
- **1 Owner**: Mohanraj (owner@freshbake.com)
- **3 Managers**: Priya, Karthik, Divya (one per branch)
- **15 Workers**: 5 workers per branch with various designations

#### Business Data
- **Products**: Bakery items (breads, cakes, pastries, etc.)
- **Inventory**: Raw materials (flour, sugar, butter, etc.)
- **Tasks**: Production and operational tasks
- **Attendance**: Daily attendance records
- **Shifts**: Morning, afternoon, and night shifts
- **Bills**: 90 historical bills (30 per branch)
- **Sales**: Derived from bills
- **Expenses**: Monthly expenses per branch
- **Logistics**: Delivery and material movement records
- **AI Data**: Predictions and anomalies

### Verification Queries

Run these queries to verify the seed data:

```sql
-- Verify users
SELECT id, email, name, role FROM users;

-- Verify organization
SELECT * FROM organizations;

-- Verify branches
SELECT * FROM branches;

-- Verify workers with branch info
SELECT w.id, w.employee_id, u.name, w.designation, b.name as branch_name
FROM workers w
JOIN users u ON w.user_id = u.id
JOIN branches b ON w.branch_id = b.id;

-- Verify tasks
SELECT t.id, t.title, t.status, b.name as branch_name
FROM tasks t
JOIN branches b ON t.branch_id = b.id;

-- Verify today's attendance
SELECT a.date, a.status, u.name, b.name as branch_name
FROM attendance a
JOIN workers w ON a.worker_id = w.id
JOIN users u ON w.user_id = u.id
JOIN branches b ON a.branch_id = b.id
WHERE a.date = CURDATE();

-- Verify inventory
SELECT i.name, i.quantity, i.unit, b.name as branch_name
FROM inventory i
JOIN branches b ON i.branch_id = b.id;

-- Verify today's sales
SELECT SUM(s.amount) as total_sales, b.name as branch_name
FROM sales s
JOIN branches b ON s.branch_id = b.id
WHERE s.sale_date = CURDATE()
GROUP BY b.id, b.name;
```

### Reset Database

To reset the database and re-seed:

```sql
-- WARNING: This will delete all data
DROP DATABASE IF EXISTS sems_db;
CREATE DATABASE sems_db;
USE sems_db;

-- Then run schema and seed data again
source C:/Users/shwet/Desktop/SEMS_APP/database/sems_schema.sql;
source C:/Users/shwet/Desktop/SEMS_APP/database/sems_bakery_seed.sql;
```

### Troubleshooting

#### Connection Issues
- Ensure MySQL server is running
- Check credentials in application.properties
- Verify database name matches (sems_db)
- Check firewall settings

#### Seed Data Issues
- Ensure both schema and seed files are executed
- Check for foreign key constraint violations
- Verify unique constraint violations (emails, employee IDs)

#### Character Encoding
If you encounter character encoding issues:
```sql
ALTER DATABASE sems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Production Deployment

For production deployment:

1. **Use Environment Variables**:
   - `DATABASE_URL`
   - `DATABASE_USERNAME`
   - `DATABASE_PASSWORD`

2. **Secure Credentials**:
   - Never commit database passwords to Git
   - Use strong passwords
   - Restrict database user permissions

3. **Backup Strategy**:
   - Regular database backups
   - Test restore procedures
   - Keep seed data for reference

### Support

For database-related issues:
1. Check MySQL error logs
2. Verify connection settings
3. Test with MySQL Workbench
4. Review seed data SQL for syntax errors

---

**Last Updated**: 2026-09-13
**SEMS Version**: Operational Prototype v1.0

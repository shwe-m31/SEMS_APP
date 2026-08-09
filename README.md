# SEMS - Smart Enterprise Management System

**Tagline:** Centralized Multi-Branch Workforce & Business Management with AI-Powered Insights

## Overview

SEMS is a comprehensive full-stack web application prototype designed for MSMEs and multi-unit businesses to manage operations across multiple branches/business units through a centralized platform. The system supports role-based access for Owners, Admins/Branch Managers, and Workers.

## Technology Stack

### Backend
- **Java** - Programming language
- **Spring Boot 3.1.5** - Framework
- **Spring Security** - Security framework
- **JWT (io.jsonwebtoken)** - Authentication tokens
- **Spring Data JPA / Hibernate** - ORM
- **MySQL** - Database
- **Maven** - Build tool

### Frontend
- **React 18** - UI library
- **React Router DOM 6** - Routing
- **Axios** - HTTP client
- **Recharts** - Charting library

## Project Structure

```
SEMS_APP/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sems/
│   │   │   │   ├── config/        # Configuration classes
│   │   │   │   ├── controller/    # REST controllers
│   │   │   │   ├── dto/           # Data transfer objects
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── repository/    # JPA repositories
│   │   │   │   ├── security/      # Security configuration
│   │   │   │   └── service/       # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── frontend/                # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── database/                # Database scripts
│   └── sems_schema.sql
└── README.md
```

## Prerequisites

- **Java 17** or higher
- **Maven 3.6** or higher
- **Node.js 16** or higher
- **MySQL 8.0** or higher
- **Git** (optional)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SEMS_APP
```

### 2. Database Setup

#### Install MySQL
- Download and install MySQL from https://dev.mysql.com/downloads/mysql/
- Start MySQL service

#### Create Database
Option 1: Using MySQL Workbench or command line:
```sql
CREATE DATABASE sems_db;
```

Option 2: Run the provided schema script:
```bash
mysql -u root -p < database/sems_schema.sql
```

The schema script includes:
- All required tables with proper relationships
- Sample/demo data for testing
- Default password for demo users: `password123`

### 3. Backend Configuration

#### Update Database Credentials
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sems_db
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

#### Build and Run Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Run Frontend
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Demo Credentials

The database comes pre-loaded with demo users:

### Owner Account
- **Email:** owner@sems.com
- **Password:** password123
- **Access:** Owner Dashboard, AI Insights

### Admin Accounts
- **Email:** admin1@sems.com (Branch 1 Manager)
- **Email:** admin2@sems.com (Branch 2 Manager)
- **Email:** admin3@sems.com (Branch 3 Manager)
- **Password:** password123
- **Access:** Admin Dashboard, AI Insights

### Worker Accounts
- **Email:** worker1@sems.com through worker15@sems.com
- **Password:** password123
- **Access:** Worker Dashboard

## Features

### Core Features
- **Multi-Branch Management** - Manage multiple business units from one platform
- **Role-Based Access Control** - Owner, Admin, and Worker roles with specific permissions
- **Worker Management** - Add, update, and manage workers across branches
- **Task Allocation** - Assign tasks to workers with priorities and due dates
- **Attendance Management** - Track worker attendance with status (Present, Absent, Late, Half-Day)
- **Shift Management** - Create and manage work shifts (Morning, Afternoon, Evening, Night)
- **Inventory Management** - Track stock levels with low-stock alerts
- **Billing System** - Generate bills with automatic inventory and sales updates
- **Expense Tracking** - Record and categorize business expenses
- **Logistics Management** - Track goods movement between branches
- **Sales Management** - Monitor sales trends and performance

### AI-Powered Features
- **Inventory Demand Forecasting** - Predict future inventory needs based on historical data
- **Sales Trend Prediction** - Forecast sales trends and revenue
- **Worker Productivity Insights** - Analyze task completion rates and productivity
- **Anomaly Detection** - Identify unusual patterns in sales, inventory, and operations

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/owner` - Owner dashboard data
- `GET /api/dashboard/admin/{branchId}` - Admin dashboard data
- `GET /api/dashboard/worker` - Worker dashboard data

### Branch Management
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create new branch
- `PUT /api/branches/{id}` - Update branch
- `DELETE /api/branches/{id}` - Delete branch

### Worker Management
- `GET /api/workers/branch/{branchId}` - Get workers by branch
- `POST /api/workers` - Create new worker
- `PUT /api/workers/{id}` - Update worker
- `DELETE /api/workers/{id}` - Delete worker

### Task Management
- `GET /api/tasks/branch/{branchId}` - Get tasks by branch
- `GET /api/tasks/worker/{workerId}` - Get tasks by worker
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Attendance
- `GET /api/attendance/worker/{workerId}` - Get worker attendance
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/{id}` - Update attendance

### Inventory
- `GET /api/inventory/branch/{branchId}` - Get branch inventory
- `GET /api/inventory/low-stock/{branchId}` - Get low stock items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/{id}` - Update inventory
- `PATCH /api/inventory/{id}/stock` - Update stock quantity

### Billing
- `GET /api/billing/branch/{branchId}` - Get branch bills
- `POST /api/billing` - Create new bill

### Expenses
- `GET /api/expenses/branch/{branchId}` - Get branch expenses
- `POST /api/expenses` - Record expense
- `PUT /api/expenses/{id}` - Update expense

### Logistics
- `GET /api/logistics/branch/{branchId}` - Get branch logistics
- `POST /api/logistics` - Create logistics entry

### Sales
- `GET /api/sales/branch/{branchId}` - Get branch sales
- `GET /api/sales/total/branch/{branchId}` - Get total sales

### AI Analytics
- `GET /api/ai/forecast/inventory/{branchId}/{itemName}` - Forecast inventory demand
- `GET /api/ai/predict/sales/{branchId}` - Predict sales trend
- `GET /api/ai/analyze/productivity/{branchId}` - Analyze worker productivity
- `GET /api/ai/detect/anomalies/{branchId}` - Detect anomalies
- `GET /api/ai/predictions/{branchId}` - Get all predictions
- `GET /api/ai/anomalies/{branchId}` - Get all anomalies

## Demo Flow

1. **Landing Page** - Visit `http://localhost:3000` to see the landing page
2. **Registration** - Click "Create New Account" to register as Owner or Worker
3. **Login** - Use demo credentials or your registered account
4. **Owner Dashboard** - View organization overview, branch performance, and KPIs
5. **Admin Dashboard** - Manage branch operations, workers, tasks, and inventory
6. **Worker Dashboard** - View assigned tasks, mark attendance, and check schedule
7. **AI Insights** - Navigate to AI Insights to view predictions and anomaly detection

## Supported Industries

SEMS is designed to support multiple industries:
- 🏪 **Food & Retail** - Bakeries, Tea Shops, Restaurants, Supermarkets
- 🍽️ **Food Service** - Cafes, Catering Services
- 🧵 **Textile & Fabric** - Manufacturing units, Garment production
- 🏭 **Manufacturing** - Production units, Assembly workshops
- 📦 **Logistics** - Warehouses, Distribution businesses
- 🏢 **MSMEs** - Other operationally intensive small businesses

## Security Features

- JWT-based authentication
- Role-based authorization (OWNER, ADMIN, WORKER)
- Password hashing with BCrypt
- Protected API endpoints
- CORS configuration
- Input validation

## Important Notes

### Prototype Limitations
- This is a **prototype/academic project** for demonstration purposes
- AI predictions use simulated algorithms and demo data
- Confidence levels are not based on actual model evaluation
- Do not use in production without proper security review and testing

### Data
- Sample data is pre-loaded for demonstration
- All demo users have password: `password123`
- Database can be reset by running the schema script again

## Troubleshooting

### Backend Issues
- **Port 8080 already in use:** Change `server.port` in `application.properties`
- **Database connection failed:** Verify MySQL is running and credentials are correct
- **Build failures:** Run `mvn clean install` to rebuild dependencies

### Frontend Issues
- **Port 3000 already in use:** React will automatically use the next available port
- **API connection errors:** Ensure backend is running on port 8080
- **Dependency issues:** Delete `node_modules` and run `npm install` again

## Development

### Adding New Features
1. Create entity in `backend/src/main/java/com/sems/entity/`
2. Create repository in `backend/src/main/java/com/sems/repository/`
3. Create service in `backend/src/main/java/com/sems/service/`
4. Create controller in `backend/src/main/java/com/sems/controller/`
5. Add API methods in `frontend/src/services/api.js`
6. Create UI components in `frontend/src/pages/` or `frontend/src/components/`

### Database Changes
- Update `database/sems_schema.sql`
- Or let Hibernate auto-update with `spring.jpa.hibernate.ddl-auto=update`

## Future Enhancements

- Real-time notifications with WebSocket
- Advanced reporting with PDF export
- Mobile app (React Native)
- Enhanced AI/ML models with actual training
- Multi-language support
- Advanced analytics dashboard
- Integration with payment gateways
- Barcode/QR code scanning for inventory

## License

This is an academic prototype project. Use for educational purposes only.

## Contact

For questions or issues, please refer to the project documentation or contact the development team.

---

**SEMS - Smart Enterprise Management System**  
*Centralized Multi-Branch Workforce & Business Management with AI-Powered Insights*

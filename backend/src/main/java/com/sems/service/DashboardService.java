package com.sems.service;

import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {
    
    private final BranchRepository branchRepository;
    private final WorkerRepository workerRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;
    private final InventoryRepository inventoryRepository;
    private final SalesRepository salesRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final AdminRepository adminRepository;
    private final RestaurantOrderRepository orderRepository;
    private final RestaurantOrderItemRepository orderItemRepository;
    private final WorkerIssueRepository issueRepository;
    
    public DashboardService(BranchRepository branchRepository, WorkerRepository workerRepository,
                            TaskRepository taskRepository, AttendanceRepository attendanceRepository,
                            InventoryRepository inventoryRepository, SalesRepository salesRepository,
                            ExpenseRepository expenseRepository, UserRepository userRepository,
                            OrganizationRepository organizationRepository, AdminRepository adminRepository,
                            RestaurantOrderRepository orderRepository, RestaurantOrderItemRepository orderItemRepository,
                            WorkerIssueRepository issueRepository) {
        this.branchRepository = branchRepository;
        this.workerRepository = workerRepository;
        this.taskRepository = taskRepository;
        this.attendanceRepository = attendanceRepository;
        this.inventoryRepository = inventoryRepository;
        this.salesRepository = salesRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.adminRepository = adminRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.issueRepository = issueRepository;
    }
    
    private void checkPasswordChangeRequired(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && Boolean.TRUE.equals(user.getMustChangePassword())) {
            throw new AccessDeniedException("Password change required before accessing system resources");
        }
    }

    public Map<String, Object> getOwnerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        checkPasswordChangeRequired(userPrincipal.getId());
        
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        if (user == null) return null;
        
        List<Organization> organizations = organizationRepository.findByOwnerId(user.getId());
        if (organizations.isEmpty()) return null;
        
        Organization organization = organizations.get(0);
        List<Branch> branches = branchRepository.findByOrganizationId(organization.getId());
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("organization", organization);
        dashboard.put("ownerName", user.getName());
        dashboard.put("totalBranches", branches.size());
        
        int totalWorkers = 0;
        int totalAdmins = 0;
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        long totalOrdersToday = 0;
        int totalInventory = 0;
        int pendingTasks = 0;
        int presentToday = 0;
        int lowStockCount = 0;
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<Map<String, Object>> branchDetailsList = new ArrayList<>();
        List<Map<String, Object>> allAdminsList = new ArrayList<>();

        for (Branch branch : branches) {
            List<Worker> workers = workerRepository.findByBranchId(branch.getId());
            totalWorkers += workers.size();
            
            List<Admin> branchAdmins = adminRepository.findByBranchId(branch.getId());
            totalAdmins += branchAdmins.size();

            for (Admin bAdmin : branchAdmins) {
                Map<String, Object> aMap = new HashMap<>();
                aMap.put("id", bAdmin.getId());
                aMap.put("name", bAdmin.getUser().getName());
                aMap.put("email", bAdmin.getUser().getEmail());
                aMap.put("phone", bAdmin.getUser().getPhone());
                aMap.put("username", bAdmin.getUser().getUsername());
                aMap.put("designation", bAdmin.getDesignation());
                aMap.put("branchId", branch.getId());
                aMap.put("branchName", branch.getName());
                aMap.put("branchCode", branch.getBranchCode());
                aMap.put("temporaryPassword", bAdmin.getTemporaryPassword() != null ? bAdmin.getTemporaryPassword() : "password123");
                aMap.put("mustChangePassword", bAdmin.getUser().getMustChangePassword());
                allAdminsList.add(aMap);
            }

            Map<String, Object> bMap = new HashMap<>();
            bMap.put("id", branch.getId());
            bMap.put("name", branch.getName());
            bMap.put("branchCode", branch.getBranchCode());
            bMap.put("state", branch.getState());
            bMap.put("city", branch.getCity());
            bMap.put("pincode", branch.getPincode());
            bMap.put("category", branch.getCategory() != null ? branch.getCategory() : organization.getCategory());
            bMap.put("organizationType", branch.getOrganizationType() != null ? branch.getOrganizationType() : organization.getSubCategory());
            bMap.put("location", branch.getLocation());
            bMap.put("address", branch.getAddress());
            bMap.put("phone", branch.getPhone());
            bMap.put("workerCount", workers.size());

            if (!branchAdmins.isEmpty()) {
                Admin firstAdmin = branchAdmins.get(0);
                Map<String, Object> adminMap = new HashMap<>();
                adminMap.put("id", firstAdmin.getId());
                adminMap.put("name", firstAdmin.getUser().getName());
                adminMap.put("email", firstAdmin.getUser().getEmail());
                adminMap.put("phone", firstAdmin.getUser().getPhone());
                adminMap.put("username", firstAdmin.getUser().getUsername());
                adminMap.put("designation", firstAdmin.getDesignation());
                adminMap.put("temporaryPassword", firstAdmin.getTemporaryPassword() != null ? firstAdmin.getTemporaryPassword() : "password123");
                adminMap.put("mustChangePassword", firstAdmin.getUser().getMustChangePassword());
                bMap.put("admin", adminMap);
            } else {
                bMap.put("admin", null);
            }

            // Branch sales today
            BigDecimal branchSalesSum = BigDecimal.ZERO;
            List<Sales> branchSales = salesRepository.findByBranchIdAndSaleDateBetween(
                branch.getId(), LocalDate.now(), LocalDate.now());
            for (Sales sale : branchSales) {
                branchSalesSum = branchSalesSum.add(sale.getAmount());
            }
            totalSales = totalSales.add(branchSalesSum);
            bMap.put("todaySales", branchSalesSum);

            // Branch expenses today
            BigDecimal branchExpensesSum = BigDecimal.ZERO;
            List<Expense> branchExpenses = expenseRepository.findByBranchIdAndExpenseDateBetween(
                branch.getId(), LocalDate.now(), LocalDate.now());
            for (Expense exp : branchExpenses) {
                branchExpensesSum = branchExpensesSum.add(exp.getAmount());
            }
            totalExpenses = totalExpenses.add(branchExpensesSum);
            bMap.put("todayExpenses", branchExpensesSum);

            // Branch orders today
            long branchOrdersToday = orderRepository.countTodayOrders(branch.getId(), startOfDay);
            totalOrdersToday += branchOrdersToday;
            bMap.put("todayOrders", branchOrdersToday);

            // Branch low stock
            List<Inventory> inventories = inventoryRepository.findByBranchId(branch.getId());
            totalInventory += inventories.size();
            long branchLowStock = inventories.stream()
                    .filter(i -> i.getMinimumStockLevel() != null && i.getQuantity().compareTo(i.getMinimumStockLevel()) <= 0)
                    .count();
            lowStockCount += branchLowStock;
            bMap.put("lowStockCount", branchLowStock);
            
            List<Task> tasks = taskRepository.findByBranchIdAndStatus(branch.getId(), Task.TaskStatus.PENDING);
            pendingTasks += tasks.size();
            
            List<Attendance> attendances = attendanceRepository.findByBranchIdAndDate(branch.getId(), LocalDate.now());
            long branchPresent = attendances.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                    .count();
            presentToday += branchPresent;
            bMap.put("presentCount", branchPresent);

            branchDetailsList.add(bMap);
        }
        
        dashboard.put("branches", branchDetailsList);
        dashboard.put("admins", allAdminsList);
        dashboard.put("totalAdmins", totalAdmins);
        dashboard.put("totalWorkers", totalWorkers);
        dashboard.put("todaySales", totalSales);
        dashboard.put("todayExpenses", totalExpenses);
        dashboard.put("todayOrders", totalOrdersToday);
        dashboard.put("totalInventory", totalInventory);
        dashboard.put("lowStockCount", lowStockCount);
        dashboard.put("pendingTasks", pendingTasks);
        dashboard.put("attendanceToday", presentToday);

        // Top Selling Items across Organization
        List<Map<String, Object>> topSelling = orderItemRepository.findTopSellingItemsByOrganization(organization.getId());
        dashboard.put("topSellingItems", topSelling != null ? topSelling : Collections.emptyList());
        
        return dashboard;
    }
    
    public Map<String, Object> getAdminDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        checkPasswordChangeRequired(userPrincipal.getId());
        
        // Get admin's branch
        Admin admin = adminRepository.findByUserId(userPrincipal.getId()).orElse(null);
        if (admin == null) return null;
        
        Branch branch = admin.getBranch();
        if (branch == null) return null;
        
        List<Worker> workers = workerRepository.findByBranchId(branch.getId());
        List<Task> pendingTasks = taskRepository.findByBranchIdAndStatus(branch.getId(), Task.TaskStatus.PENDING);
        List<Task> completedTasks = taskRepository.findByBranchIdAndStatus(branch.getId(), Task.TaskStatus.COMPLETED);
        List<Attendance> todayAttendance = attendanceRepository.findByBranchIdAndDate(branch.getId(), LocalDate.now());
        List<Inventory> inventory = inventoryRepository.findByBranchId(branch.getId());
        List<Sales> todaySales = salesRepository.findByBranchIdAndSaleDateBetween(branch.getId(), LocalDate.now(), LocalDate.now());
        List<Expense> todayExpenses = expenseRepository.findByBranchIdAndExpenseDateBetween(branch.getId(), LocalDate.now(), LocalDate.now());
        
        int presentCount = 0;
        for (Attendance attendance : todayAttendance) {
            if (attendance.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                presentCount++;
            }
        }
        int absentCount = Math.max(0, workers.size() - presentCount);
        
        BigDecimal todaySalesTotal = BigDecimal.ZERO;
        for (Sales sale : todaySales) {
            todaySalesTotal = todaySalesTotal.add(sale.getAmount());
        }

        BigDecimal todayExpensesTotal = BigDecimal.ZERO;
        for (Expense expense : todayExpenses) {
            todayExpensesTotal = todayExpensesTotal.add(expense.getAmount());
        }

        // Restaurant Orders Telemetry
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayOrdersCount = orderRepository.countTodayOrders(branch.getId(), startOfDay);
        long pendingOrders = orderRepository.countByBranchIdAndStatus(branch.getId(), OrderStatus.CREATED);
        long preparingOrders = orderRepository.countByBranchIdAndStatus(branch.getId(), OrderStatus.ACCEPTED) +
                orderRepository.countByBranchIdAndStatus(branch.getId(), OrderStatus.PREPARING);
        long readyOrders = orderRepository.countByBranchIdAndStatus(branch.getId(), OrderStatus.READY);
        long completedOrders = orderRepository.countByBranchIdAndStatus(branch.getId(), OrderStatus.COMPLETED);

        // Low stock and critical items
        long lowStockCount = inventory.stream()
                .filter(i -> i.getMinimumStockLevel() != null && i.getQuantity().compareTo(i.getMinimumStockLevel()) <= 0)
                .count();
        long criticalStockCount = inventory.stream()
                .filter(i -> i.getQuantity().compareTo(new BigDecimal("5.0")) <= 0)
                .count();

        // Worker issues
        long openIssues = issueRepository.countByBranchIdAndStatus(branch.getId(), "OPEN");
        List<WorkerIssue> recentIssues = issueRepository.findByBranchIdOrderByCreatedAtDesc(branch.getId());
        if (recentIssues.size() > 5) recentIssues = recentIssues.subList(0, 5);

        // Recent Orders
        List<RestaurantOrder> recentOrders = orderRepository.findByBranchIdOrderByCreatedAtDesc(branch.getId());
        if (recentOrders.size() > 6) recentOrders = recentOrders.subList(0, 6);
        
        Map<String, Object> dashboard = new HashMap<>();
        Map<String, Object> branchMap = new HashMap<>();
        branchMap.put("id", branch.getId());
        branchMap.put("name", branch.getName());
        branchMap.put("branchCode", branch.getBranchCode());
        branchMap.put("state", branch.getState());
        branchMap.put("city", branch.getCity());
        branchMap.put("pincode", branch.getPincode());
        branchMap.put("category", branch.getCategory());
        branchMap.put("organizationType", branch.getOrganizationType());
        branchMap.put("location", branch.getLocation());
        branchMap.put("phone", branch.getPhone());
        branchMap.put("address", branch.getAddress());

        dashboard.put("branch", branchMap);
        dashboard.put("workerCount", workers.size());
        dashboard.put("attendanceToday", presentCount);
        dashboard.put("workersAbsent", absentCount);
        dashboard.put("activeWorkers", workers.size());
        dashboard.put("pendingTasks", pendingTasks.size());
        dashboard.put("completedTasks", completedTasks.size());
        dashboard.put("currentStock", inventory.size());
        dashboard.put("lowStockCount", lowStockCount);
        dashboard.put("criticalStockCount", criticalStockCount);
        dashboard.put("todaySales", todaySalesTotal);
        dashboard.put("todayExpenses", todayExpensesTotal);

        // Orders Breakdown
        dashboard.put("todayOrders", todayOrdersCount);
        dashboard.put("pendingOrders", pendingOrders);
        dashboard.put("preparingOrders", preparingOrders);
        dashboard.put("readyOrders", readyOrders);
        dashboard.put("completedOrders", completedOrders);

        // Issues & Live Activity
        dashboard.put("openIssues", openIssues);
        dashboard.put("recentIssues", recentIssues);
        dashboard.put("recentOrders", recentOrders);
        
        return dashboard;
    }
    
    public Map<String, Object> getWorkerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        checkPasswordChangeRequired(userPrincipal.getId());
        
        Worker worker = workerRepository.findByUserId(userPrincipal.getId()).orElse(null);
        if (worker == null) return null;
        
        List<Task> assignedTasks = taskRepository.findByAssignedToId(worker.getId());
        List<Task> pendingTasks = taskRepository.findByAssignedToIdAndStatus(worker.getId(), Task.TaskStatus.PENDING);
        List<Task> completedTasks = taskRepository.findByAssignedToIdAndStatus(worker.getId(), Task.TaskStatus.COMPLETED);
        
        Attendance todayAttendance = attendanceRepository.findByWorkerIdAndDate(worker.getId(), LocalDate.now()).orElse(null);
        
        Map<String, Object> dashboard = new HashMap<>();
        Map<String, Object> workerMap = new HashMap<>();
        workerMap.put("id", worker.getId());
        workerMap.put("employeeId", worker.getEmployeeId());
        workerMap.put("designation", worker.getDesignation());
        workerMap.put("designationLabel", worker.getDesignationLabel());
        workerMap.put("salary", worker.getSalary());
        workerMap.put("hireDate", worker.getHireDate());
        workerMap.put("status", worker.getStatus() != null ? worker.getStatus().name() : "ACTIVE");

        Branch branch = worker.getBranch();
        if (branch != null) {
            Map<String, Object> bMap = new HashMap<>();
            bMap.put("id", branch.getId());
            bMap.put("name", branch.getName());
            bMap.put("branchCode", branch.getBranchCode());
            workerMap.put("branch", bMap);
        }
        dashboard.put("worker", workerMap);
        dashboard.put("assignedTasks", assignedTasks.size());
        dashboard.put("pendingTasks", pendingTasks.size());
        dashboard.put("completedTasks", completedTasks.size());
        dashboard.put("todayAttendance", todayAttendance);

        // Role/Designation-specific active operational queues
        if (branch != null) {
            String des = worker.getDesignation() != null ? worker.getDesignation().toUpperCase() : "";

            if ("CHEF".equals(des)) {
                // Chef: orders that are CREATED, ACCEPTED, PREPARING
                List<RestaurantOrder> newOrders = orderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(branch.getId(), OrderStatus.CREATED);
                List<RestaurantOrder> acceptedOrders = orderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(branch.getId(), OrderStatus.ACCEPTED);
                List<RestaurantOrder> preparingOrders = orderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(branch.getId(), OrderStatus.PREPARING);
                dashboard.put("newOrders", newOrders);
                dashboard.put("preparingOrders", preparingOrders);
                dashboard.put("acceptedOrders", acceptedOrders);
            } else if ("WAITER".equals(des)) {
                // Waiter: orders that are READY for serving, and recently SERVED
                List<RestaurantOrder> readyOrders = orderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(branch.getId(), OrderStatus.READY);
                List<RestaurantOrder> servedOrders = orderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(branch.getId(), OrderStatus.SERVED);
                dashboard.put("readyOrders", readyOrders);
                dashboard.put("servedOrders", servedOrders);
            } else if ("CASHIER".equals(des)) {
                // Cashier: orders that are SERVED (ready for billing)
                List<RestaurantOrder> pendingBills = orderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(branch.getId(), OrderStatus.SERVED);
                List<RestaurantOrder> completedOrders = orderRepository.findByBranchIdAndStatusOrderByCreatedAtDesc(branch.getId(), OrderStatus.COMPLETED);
                dashboard.put("pendingBills", pendingBills);
                dashboard.put("completedOrders", completedOrders);
            } else if ("INVENTORY_WORKER".equals(des)) {
                // Inventory worker: low stock items
                List<Inventory> inventories = inventoryRepository.findByBranchId(branch.getId());
                List<Inventory> lowStock = inventories.stream()
                        .filter(i -> i.getMinimumStockLevel() != null && i.getQuantity().compareTo(i.getMinimumStockLevel()) <= 0)
                        .toList();
                dashboard.put("lowStockItems", lowStock);
                dashboard.put("inventoryTotal", inventories.size());
            }
        }
        
        return dashboard;
    }
}

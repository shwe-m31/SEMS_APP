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
    
    public DashboardService(BranchRepository branchRepository, WorkerRepository workerRepository,
                           TaskRepository taskRepository, AttendanceRepository attendanceRepository,
                           InventoryRepository inventoryRepository, SalesRepository salesRepository,
                           ExpenseRepository expenseRepository, UserRepository userRepository,
                           OrganizationRepository organizationRepository, AdminRepository adminRepository) {
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
        int totalInventory = 0;
        int pendingTasks = 0;
        int presentToday = 0;
        
        List<Map<String, Object>> branchDetailsList = new ArrayList<>();

        for (Branch branch : branches) {
            List<Worker> workers = workerRepository.findByBranchId(branch.getId());
            totalWorkers += workers.size();
            
            List<Admin> branchAdmins = adminRepository.findByBranchId(branch.getId());
            totalAdmins += branchAdmins.size();

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

            if (!branchAdmins.isEmpty()) {
                Admin firstAdmin = branchAdmins.get(0);
                Map<String, Object> adminMap = new HashMap<>();
                adminMap.put("id", firstAdmin.getId());
                adminMap.put("name", firstAdmin.getUser().getName());
                adminMap.put("email", firstAdmin.getUser().getEmail());
                adminMap.put("phone", firstAdmin.getUser().getPhone());
                adminMap.put("designation", firstAdmin.getDesignation());
                bMap.put("admin", adminMap);
            } else {
                bMap.put("admin", null);
            }

            branchDetailsList.add(bMap);

            List<Sales> branchSales = salesRepository.findByBranchIdAndSaleDateBetween(
                branch.getId(), LocalDate.now(), LocalDate.now());
            for (Sales sale : branchSales) {
                totalSales = totalSales.add(sale.getAmount());
            }
            
            List<Inventory> inventories = inventoryRepository.findByBranchId(branch.getId());
            totalInventory += inventories.size();
            
            List<Task> tasks = taskRepository.findByBranchIdAndStatus(branch.getId(), Task.TaskStatus.PENDING);
            pendingTasks += tasks.size();
            
            List<Attendance> attendances = attendanceRepository.findByBranchIdAndDate(branch.getId(), LocalDate.now());
            for (Attendance attendance : attendances) {
                if (attendance.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                    presentToday++;
                }
            }
        }
        
        dashboard.put("branches", branchDetailsList);
        dashboard.put("totalAdmins", totalAdmins);
        dashboard.put("totalWorkers", totalWorkers);
        dashboard.put("todaySales", totalSales);
        dashboard.put("totalInventory", totalInventory);
        dashboard.put("pendingTasks", pendingTasks);
        dashboard.put("attendanceToday", presentToday);
        
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
        List<Attendance> todayAttendance = attendanceRepository.findByBranchIdAndDate(branch.getId(), LocalDate.now());
        List<Inventory> inventory = inventoryRepository.findByBranchId(branch.getId());
        List<Sales> todaySales = salesRepository.findByBranchIdAndSaleDateBetween(branch.getId(), LocalDate.now(), LocalDate.now());
        
        int presentCount = 0;
        for (Attendance attendance : todayAttendance) {
            if (attendance.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                presentCount++;
            }
        }
        
        BigDecimal todaySalesTotal = BigDecimal.ZERO;
        for (Sales sale : todaySales) {
            todaySalesTotal = todaySalesTotal.add(sale.getAmount());
        }
        
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
        dashboard.put("pendingTasks", pendingTasks.size());
        dashboard.put("currentStock", inventory.size());
        dashboard.put("todaySales", todaySalesTotal);
        
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
        workerMap.put("salary", worker.getSalary());
        workerMap.put("hireDate", worker.getHireDate());
        workerMap.put("status", worker.getStatus() != null ? worker.getStatus().name() : "ACTIVE");
        if (worker.getBranch() != null) {
            Map<String, Object> bMap = new HashMap<>();
            bMap.put("id", worker.getBranch().getId());
            bMap.put("name", worker.getBranch().getName());
            bMap.put("branchCode", worker.getBranch().getBranchCode());
            workerMap.put("branch", bMap);
        }
        dashboard.put("worker", workerMap);
        dashboard.put("assignedTasks", assignedTasks.size());
        dashboard.put("pendingTasks", pendingTasks.size());
        dashboard.put("completedTasks", completedTasks.size());
        dashboard.put("todayAttendance", todayAttendance);
        
        return dashboard;
    }
}

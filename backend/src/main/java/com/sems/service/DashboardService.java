package com.sems.service;

import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    
    public Map<String, Object> getOwnerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        if (user == null) return null;
        
        List<Organization> organizations = organizationRepository.findByOwnerId(user.getId());
        if (organizations.isEmpty()) return null;
        
        Organization organization = organizations.get(0);
        List<Branch> branches = branchRepository.findByOrganizationId(organization.getId());
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("organization", organization);
        dashboard.put("branches", branches);
        dashboard.put("totalBranches", branches.size());
        
        int totalWorkers = 0;
        BigDecimal totalSales = BigDecimal.ZERO;
        int totalInventory = 0;
        int pendingTasks = 0;
        int presentToday = 0;
        
        for (Branch branch : branches) {
            List<Worker> workers = workerRepository.findByBranchId(branch.getId());
            totalWorkers += workers.size();
            
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
        
        dashboard.put("totalWorkers", totalWorkers);
        dashboard.put("todaySales", totalSales);
        dashboard.put("totalInventory", totalInventory);
        dashboard.put("pendingTasks", pendingTasks);
        dashboard.put("attendanceToday", presentToday);
        
        return dashboard;
    }
    
    public Map<String, Object> getAdminDashboard(Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        List<Worker> workers = workerRepository.findByBranchId(branch.getId());
        List<Task> pendingTasks = taskRepository.findByBranchIdAndStatus(branchId, Task.TaskStatus.PENDING);
        List<Attendance> todayAttendance = attendanceRepository.findByBranchIdAndDate(branchId, LocalDate.now());
        List<Inventory> inventory = inventoryRepository.findByBranchId(branchId);
        List<Sales> todaySales = salesRepository.findByBranchIdAndSaleDateBetween(branchId, LocalDate.now(), LocalDate.now());
        
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
        dashboard.put("branch", branch);
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
        
        Worker worker = workerRepository.findByUserId(userPrincipal.getId()).orElse(null);
        if (worker == null) return null;
        
        List<Task> assignedTasks = taskRepository.findByAssignedToId(worker.getId());
        List<Task> pendingTasks = taskRepository.findByAssignedToIdAndStatus(worker.getId(), Task.TaskStatus.PENDING);
        List<Task> completedTasks = taskRepository.findByAssignedToIdAndStatus(worker.getId(), Task.TaskStatus.COMPLETED);
        
        Attendance todayAttendance = attendanceRepository.findByWorkerIdAndDate(worker.getId(), LocalDate.now()).orElse(null);
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("worker", worker);
        dashboard.put("assignedTasks", assignedTasks.size());
        dashboard.put("pendingTasks", pendingTasks.size());
        dashboard.put("completedTasks", completedTasks.size());
        dashboard.put("todayAttendance", todayAttendance);
        
        return dashboard;
    }
}

package com.sems.controller;

import com.sems.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> getOwnerDashboard() {
        Map<String, Object> dashboard = dashboardService.getOwnerDashboard();
        if (dashboard != null) {
            return ResponseEntity.ok(dashboard);
        }
        return ResponseEntity.badRequest().body("Unable to fetch dashboard data");
    }
    
    @GetMapping("/admin/{branchId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboard(@PathVariable Long branchId) {
        Map<String, Object> dashboard = dashboardService.getAdminDashboard(branchId);
        if (dashboard != null) {
            return ResponseEntity.ok(dashboard);
        }
        return ResponseEntity.badRequest().body("Unable to fetch dashboard data");
    }
    
    @GetMapping("/worker")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> getWorkerDashboard() {
        Map<String, Object> dashboard = dashboardService.getWorkerDashboard();
        if (dashboard != null) {
            return ResponseEntity.ok(dashboard);
        }
        return ResponseEntity.badRequest().body("Unable to fetch dashboard data");
    }
}

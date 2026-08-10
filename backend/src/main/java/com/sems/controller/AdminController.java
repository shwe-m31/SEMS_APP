package com.sems.controller;

import com.sems.entity.Admin;
import com.sems.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAdminsForOwner());
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Admin>> getAdminsByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(adminService.getAdminsByBranch(branchId));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, Object> body) {
        try {
            Admin admin = adminService.createAdmin(
                (String) body.get("name"),
                (String) body.get("email"),
                (String) body.get("password"),
                (String) body.get("phone"),
                Long.valueOf(body.get("branchId").toString()),
                (String) body.get("designation")
            );
            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Long branchId = body.get("branchId") != null ? Long.valueOf(body.get("branchId").toString()) : null;
            Admin admin = adminService.updateAdmin(id, (String) body.get("designation"), branchId);
            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}

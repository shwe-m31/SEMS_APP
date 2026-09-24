package com.sems.controller;

import com.sems.dto.WorkerCreationRequest;
import com.sems.dto.WorkerCreationResponse;
import com.sems.entity.Worker;
import com.sems.service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {
    
    private final WorkerService workerService;
    
    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Worker>> getWorkersByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(workerService.getWorkersByBranch(branchId));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        Worker worker = workerService.getWorkerById(id);
        if (worker != null) {
            return ResponseEntity.ok(worker);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> createWorker(@RequestBody Map<String, Object> workerData) {
        try {
            WorkerCreationRequest request = new WorkerCreationRequest();
            request.setName((String) workerData.get("name"));
            request.setEmail((String) workerData.get("email"));
            request.setPhone((String) workerData.get("phone"));
            request.setDateOfBirth((String) workerData.get("dateOfBirth"));
            request.setGender((String) workerData.get("gender"));
            request.setDesignation((String) workerData.get("designation"));
            if (workerData.get("salary") != null && !workerData.get("salary").toString().isEmpty()) {
                request.setSalary(new BigDecimal(workerData.get("salary").toString()));
            }
            request.setHireDate((String) workerData.get("hireDate"));
            if (workerData.get("branchId") != null && !workerData.get("branchId").toString().isEmpty()) {
                request.setBranchId(Long.valueOf(workerData.get("branchId").toString()));
            }

            WorkerCreationResponse response = workerService.createWorkerWithCredentials(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage() != null ? e.getMessage() : "Failed to create worker"
            ));
        }
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> resetWorkerPassword(@PathVariable Long id) {
        try {
            WorkerCreationResponse response = workerService.resetWorkerPassword(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage() != null ? e.getMessage() : "Failed to reset worker password"
            ));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Worker> updateWorker(@PathVariable Long id, @RequestBody Worker worker) {
        Worker updatedWorker = workerService.updateWorker(id, worker);
        if (updatedWorker != null) {
            return ResponseEntity.ok(updatedWorker);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return ResponseEntity.ok().build();
    }
}

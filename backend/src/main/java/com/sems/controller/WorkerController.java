package com.sems.controller;

import com.sems.entity.Worker;
import com.sems.service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Worker> createWorker(@RequestBody Map<String, Object> workerData) {
        Worker worker = new Worker();
        worker.setEmployeeId((String) workerData.get("employeeId"));
        worker.setDesignation((String) workerData.get("designation"));
        worker.setHireDate(java.time.LocalDate.parse((String) workerData.get("hireDate")));
        
        Worker createdWorker = workerService.createWorker(
            worker,
            (String) workerData.get("email"),
            (String) workerData.get("password"),
            (String) workerData.get("name")
        );
        
        if (createdWorker != null) {
            return ResponseEntity.ok(createdWorker);
        }
        return ResponseEntity.badRequest().build();
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

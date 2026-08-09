package com.sems.controller;

import com.sems.entity.Logistics;
import com.sems.service.LogisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.time.LocalDate;
@RestController
@RequestMapping("/api/logistics")
public class LogisticsController {
    
    private final LogisticsService logisticsService;
    
    public LogisticsController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Logistics>> getLogisticsByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(logisticsService.getLogisticsByBranch(branchId));
    }
    
    @GetMapping("/branch/{branchId}/status/{status}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Logistics>> getLogisticsByBranchAndStatus(
            @PathVariable Long branchId,
            @PathVariable Logistics.LogisticsStatus status) {
        return ResponseEntity.ok(logisticsService.getLogisticsByBranchAndStatus(branchId, status));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Logistics> getLogisticsById(@PathVariable Long id) {
        Logistics logistics = logisticsService.getLogisticsById(id);
        if (logistics != null) {
            return ResponseEntity.ok(logistics);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Logistics> createLogistics(@RequestBody Map<String, Object> logisticsData) {
        Logistics logistics = new Logistics();
        logistics.setItemName((String) logisticsData.get("itemName"));
        logistics.setSource((String) logisticsData.get("source"));
        logistics.setDestination((String) logisticsData.get("destination"));
        logistics.setQuantity(new BigDecimal(logisticsData.get("quantity").toString()));
        logistics.setUnit((String) logisticsData.get("unit"));
        logistics.setStatus(Logistics.LogisticsStatus.valueOf((String) logisticsData.get("status")));
        
        if (logisticsData.get("expectedDate") != null) {
            logistics.setExpectedDate(LocalDate.parse((String) logisticsData.get("expectedDate")));
        }
        
        logistics.setNotes((String) logisticsData.get("notes"));
        
        Logistics createdLogistics = logisticsService.createLogistics(
            logistics,
            Long.valueOf(logisticsData.get("branchId").toString())
        );
        
        if (createdLogistics != null) {
            return ResponseEntity.ok(createdLogistics);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Logistics> updateLogistics(@PathVariable Long id, @RequestBody Logistics logistics) {
        Logistics updatedLogistics = logisticsService.updateLogistics(id, logistics);
        if (updatedLogistics != null) {
            return ResponseEntity.ok(updatedLogistics);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteLogistics(@PathVariable Long id) {
        logisticsService.deleteLogistics(id);
        return ResponseEntity.ok().build();
    }
}

package com.sems.controller;

import com.sems.entity.Sales;
import com.sems.service.SalesService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
public class SalesController {
    
    private final SalesService salesService;
    
    public SalesController(SalesService salesService) {
        this.salesService = salesService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Sales>> getSalesByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(salesService.getSalesByBranch(branchId));
    }
    
    @GetMapping("/branch/{branchId}/range")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Sales>> getSalesByBranchAndDateRange(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(salesService.getSalesByBranchAndDateRange(branchId, startDate, endDate));
    }
    
    @GetMapping("/total/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getTotalSalesByBranch(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        BigDecimal total = salesService.getTotalSalesByBranch(branchId, startDate, endDate);
        return ResponseEntity.ok(Map.of("totalSales", total));
    }
}

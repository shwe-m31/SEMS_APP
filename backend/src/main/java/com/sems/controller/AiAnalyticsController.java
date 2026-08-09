package com.sems.controller;

import com.sems.entity.AiAnomaly;
import com.sems.entity.AiPrediction;
import com.sems.service.AiAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAnalyticsController {
    
    private final AiAnalyticsService aiAnalyticsService;
    
    public AiAnalyticsController(AiAnalyticsService aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }
    
    @GetMapping("/forecast/inventory/{branchId}/{itemName}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> forecastInventoryDemand(
            @PathVariable Long branchId,
            @PathVariable String itemName) {
        Map<String, Object> forecast = aiAnalyticsService.forecastInventoryDemand(branchId, itemName);
        if (forecast != null) {
            return ResponseEntity.ok(forecast);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @GetMapping("/predict/sales/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> predictSalesTrend(@PathVariable Long branchId) {
        Map<String, Object> prediction = aiAnalyticsService.predictSalesTrend(branchId);
        if (prediction != null) {
            return ResponseEntity.ok(prediction);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @GetMapping("/analyze/productivity/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeWorkerProductivity(@PathVariable Long branchId) {
        Map<String, Object> analysis = aiAnalyticsService.analyzeWorkerProductivity(branchId);
        if (analysis != null) {
            return ResponseEntity.ok(analysis);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @GetMapping("/detect/anomalies/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> detectAnomalies(@PathVariable Long branchId) {
        Map<String, Object> anomalies = aiAnalyticsService.detectAnomalies(branchId);
        if (anomalies != null) {
            return ResponseEntity.ok(anomalies);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @GetMapping("/predictions/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<AiPrediction>> getPredictionsByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(aiAnalyticsService.getPredictionsByBranch(branchId));
    }
    
    @GetMapping("/anomalies/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<AiAnomaly>> getAnomaliesByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(aiAnalyticsService.getAnomaliesByBranch(branchId));
    }
    
    @PutMapping("/anomalies/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<AiAnomaly> updateAnomalyStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusData) {
        AiAnomaly anomaly = aiAnalyticsService.updateAnomalyStatus(
            id,
            AiAnomaly.AnomalyStatus.valueOf(statusData.get("status"))
        );
        if (anomaly != null) {
            return ResponseEntity.ok(anomaly);
        }
        return ResponseEntity.notFound().build();
    }
}

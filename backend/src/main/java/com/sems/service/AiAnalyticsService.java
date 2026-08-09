package com.sems.service;

import com.sems.entity.*;
import com.sems.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class AiAnalyticsService {
    
    private final AiPredictionRepository predictionRepository;
    private final AiAnomalyRepository anomalyRepository;
    private final SalesRepository salesRepository;
    private final InventoryRepository inventoryRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;
    private final BranchRepository branchRepository;
    private final WorkerRepository workerRepository;
    
    public AiAnalyticsService(AiPredictionRepository predictionRepository, AiAnomalyRepository anomalyRepository,
                             SalesRepository salesRepository, InventoryRepository inventoryRepository,
                             TaskRepository taskRepository, AttendanceRepository attendanceRepository,
                             BranchRepository branchRepository, WorkerRepository workerRepository) {
        this.predictionRepository = predictionRepository;
        this.anomalyRepository = anomalyRepository;
        this.salesRepository = salesRepository;
        this.inventoryRepository = inventoryRepository;
        this.taskRepository = taskRepository;
        this.attendanceRepository = attendanceRepository;
        this.branchRepository = branchRepository;
        this.workerRepository = workerRepository;
    }
    
    // AI Feature 1: Inventory Demand Forecasting
    @Transactional
    public Map<String, Object> forecastInventoryDemand(Long branchId, String itemName) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        List<Inventory> inventories = inventoryRepository.findByBranchId(branchId);
        Inventory targetInventory = inventories.stream()
            .filter(inv -> inv.getName().equalsIgnoreCase(itemName))
            .findFirst()
            .orElse(null);
        
        if (targetInventory == null) return null;
        
        // Get historical sales data for the past 30 days
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Sales> historicalSales = salesRepository.findByBranchIdAndSaleDateBetween(branchId, startDate, endDate);
        
        // Calculate average daily sales for this item
        BigDecimal totalSold = historicalSales.stream()
            .filter(sale -> sale.getProductName() != null && sale.getProductName().equalsIgnoreCase(itemName))
            .map(Sales::getQuantity)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal avgDailySales = totalSold.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
        
        // Predict demand for next 7 days
        BigDecimal predictedDemand = avgDailySales.multiply(BigDecimal.valueOf(7));
        
        // Generate prediction
        AiPrediction prediction = new AiPrediction();
        prediction.setBranch(branch);
        prediction.setPredictionType(AiPrediction.PredictionType.INVENTORY_DEMAND);
        prediction.setItemName(itemName);
        prediction.setCurrentValue(targetInventory.getQuantity());
        prediction.setPredictedValue(predictedDemand);
        prediction.setPredictionDate(LocalDate.now().plusDays(7));
        prediction.setConfidenceLevel(BigDecimal.valueOf(75.00)); // Prototype confidence level
        
        String recommendation;
        if (predictedDemand.compareTo(targetInventory.getQuantity()) > 0) {
            recommendation = "Expected demand may exceed current stock. Consider restocking " + 
                predictedDemand.subtract(targetInventory.getQuantity()) + " units.";
        } else {
            recommendation = "Current stock is sufficient for predicted demand.";
        }
        prediction.setRecommendation(recommendation);
        
        predictionRepository.save(prediction);
        
        Map<String, Object> result = new HashMap<>();
        result.put("itemName", itemName);
        result.put("currentStock", targetInventory.getQuantity());
        result.put("predictedDemand", predictedDemand);
        result.put("predictionDate", LocalDate.now().plusDays(7));
        result.put("confidenceLevel", 75.00);
        result.put("recommendation", recommendation);
        result.put("isPrototype", true);
        
        return result;
    }
    
    // AI Feature 2: Sales Trend Prediction
    @Transactional
    public Map<String, Object> predictSalesTrend(Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        // Get historical sales data for the past 30 days
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Sales> historicalSales = salesRepository.findByBranchIdAndSaleDateBetween(branchId, startDate, endDate);
        
        // Calculate total sales for past period
        BigDecimal totalSales = historicalSales.stream()
            .map(Sales::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate average daily sales
        BigDecimal avgDailySales = totalSales.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
        
        // Predict sales for next week (7 days)
        BigDecimal predictedSales = avgDailySales.multiply(BigDecimal.valueOf(7));
        
        // Calculate trend
        String trend;
        if (predictedSales.compareTo(totalSales.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP)) > 0) {
            trend = "INCREASING";
        } else if (predictedSales.compareTo(totalSales.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP)) < 0) {
            trend = "DECREASING";
        } else {
            trend = "STABLE";
        }
        
        // Generate prediction
        AiPrediction prediction = new AiPrediction();
        prediction.setBranch(branch);
        prediction.setPredictionType(AiPrediction.PredictionType.SALES_TREND);
        prediction.setCurrentValue(totalSales);
        prediction.setPredictedValue(predictedSales);
        prediction.setPredictionDate(LocalDate.now().plusDays(7));
        prediction.setConfidenceLevel(BigDecimal.valueOf(70.00));
        prediction.setRecommendation("Sales trend is " + trend.toLowerCase() + ". Predicted sales for next week: ₹" + predictedSales);
        
        predictionRepository.save(prediction);
        
        Map<String, Object> result = new HashMap<>();
        result.put("historicalSales", totalSales);
        result.put("predictedSales", predictedSales);
        result.put("trend", trend);
        result.put("predictionDate", LocalDate.now().plusDays(7));
        result.put("confidenceLevel", 70.00);
        result.put("recommendation", prediction.getRecommendation());
        result.put("isPrototype", true);
        
        return result;
    }
    
    // AI Feature 3: Worker Productivity Insights
    @Transactional
    public Map<String, Object> analyzeWorkerProductivity(Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        List<Worker> workers = workerRepository.findByBranchId(branchId);
        
        // Get task completion data for the past week
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        
        int totalTasksAssigned = 0;
        int totalTasksCompleted = 0;
        
        for (Worker worker : workers) {
            List<Task> tasks = taskRepository.findByAssignedToId(worker.getId());
            for (Task task : tasks) {
                if (task.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1))) {
                    totalTasksAssigned++;
                    if (task.getStatus() == Task.TaskStatus.COMPLETED) {
                        totalTasksCompleted++;
                    }
                }
            }
        }
        
        double completionRate = totalTasksAssigned > 0 ? 
            (double) totalTasksCompleted / totalTasksAssigned * 100 : 0;
        
        // Generate insight
        String insight;
        if (completionRate >= 80) {
            insight = "Task completion rate is excellent (" + String.format("%.1f", completionRate) + "%).";
        } else if (completionRate >= 60) {
            insight = "Task completion rate is good (" + String.format("%.1f", completionRate) + "%).";
        } else {
            insight = "Task completion has decreased compared with previous weeks (" + String.format("%.1f", completionRate) + "%). Consider reviewing task allocation.";
        }
        
        // Generate prediction
        AiPrediction prediction = new AiPrediction();
        prediction.setBranch(branch);
        prediction.setPredictionType(AiPrediction.PredictionType.PRODUCTIVITY);
        prediction.setCurrentValue(BigDecimal.valueOf(completionRate));
        prediction.setPredictedValue(BigDecimal.valueOf(completionRate * 0.95)); // Slight decrease prediction
        prediction.setPredictionDate(LocalDate.now().plusDays(7));
        prediction.setConfidenceLevel(BigDecimal.valueOf(65.00));
        prediction.setRecommendation(insight);
        
        predictionRepository.save(prediction);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalTasksAssigned", totalTasksAssigned);
        result.put("totalTasksCompleted", totalTasksCompleted);
        result.put("completionRate", completionRate);
        result.put("insight", insight);
        result.put("confidenceLevel", 65.00);
        result.put("isPrototype", true);
        
        return result;
    }
    
    // AI Feature 4: Inventory/Sales Anomaly Detection
    @Transactional
    public Map<String, Object> detectAnomalies(Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        List<Map<String, Object>> detectedAnomalies = new ArrayList<>();
        
        // Detect sales anomalies
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        List<Sales> todaySales = salesRepository.findByBranchIdAndSaleDateBetween(branchId, today, today);
        List<Sales> yesterdaySales = salesRepository.findByBranchIdAndSaleDateBetween(branchId, yesterday, yesterday);
        
        BigDecimal todayTotal = todaySales.stream().map(Sales::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal yesterdayTotal = yesterdaySales.stream().map(Sales::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // If today's sales are more than 3x yesterday's, flag as anomaly
        if (yesterdayTotal.compareTo(BigDecimal.ZERO) > 0 && 
            todayTotal.divide(yesterdayTotal, 2, RoundingMode.HALF_UP).compareTo(BigDecimal.valueOf(3)) > 0) {
            
            AiAnomaly anomaly = new AiAnomaly();
            anomaly.setBranch(branch);
            anomaly.setAnomalyType(AiAnomaly.AnomalyType.SALES);
            anomaly.setDescription("Unusual sales activity detected: Today's sales (₹" + todayTotal + 
                ") are significantly higher than yesterday's (₹" + yesterdayTotal + ")");
            anomaly.setSeverity(AiAnomaly.AnomalySeverity.HIGH);
            anomaly.setStatus(AiAnomaly.AnomalyStatus.OPEN);
            
            anomalyRepository.save(anomaly);
            
            Map<String, Object> anomalyData = new HashMap<>();
            anomalyData.put("type", "SALES");
            anomalyData.put("description", anomaly.getDescription());
            anomalyData.put("severity", "HIGH");
            anomalyData.put("possibleCauses", Arrays.asList(
                "Unexpected demand spike",
                "Data entry error",
                "Special promotion or event"
            ));
            detectedAnomalies.add(anomalyData);
        }
        
        // Detect inventory anomalies
        List<Inventory> inventories = inventoryRepository.findByBranchId(branchId);
        for (Inventory inv : inventories) {
            if (inv.getQuantity().compareTo(inv.getMinimumStockLevel().multiply(BigDecimal.valueOf(0.5))) < 0) {
                // Stock is less than 50% of minimum level
                AiAnomaly anomaly = new AiAnomaly();
                anomaly.setBranch(branch);
                anomaly.setAnomalyType(AiAnomaly.AnomalyType.INVENTORY);
                anomaly.setDescription("Critical stock level for " + inv.getName() + 
                    ": Current (" + inv.getQuantity() + ") is below 50% of minimum (" + inv.getMinimumStockLevel() + ")");
                anomaly.setSeverity(AiAnomaly.AnomalySeverity.CRITICAL);
                anomaly.setStatus(AiAnomaly.AnomalyStatus.OPEN);
                
                anomalyRepository.save(anomaly);
                
                Map<String, Object> anomalyData = new HashMap<>();
                anomalyData.put("type", "INVENTORY");
                anomalyData.put("description", anomaly.getDescription());
                anomalyData.put("severity", "CRITICAL");
                anomalyData.put("possibleCauses", Arrays.asList(
                    "Rapid depletion",
                    "Supply chain issue",
                    "Increased demand"
                ));
                detectedAnomalies.add(anomalyData);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("anomalies", detectedAnomalies);
        result.put("totalAnomalies", detectedAnomalies.size());
        result.put("isPrototype", true);
        
        return result;
    }
    
    public List<AiPrediction> getPredictionsByBranch(Long branchId) {
        return predictionRepository.findByBranchId(branchId);
    }
    
    public List<AiAnomaly> getAnomaliesByBranch(Long branchId) {
        return anomalyRepository.findByBranchId(branchId);
    }
    
    @Transactional
    public AiAnomaly updateAnomalyStatus(Long id, AiAnomaly.AnomalyStatus status) {
        AiAnomaly anomaly = anomalyRepository.findById(id).orElse(null);
        if (anomaly == null) return null;
        
        anomaly.setStatus(status);
        return anomalyRepository.save(anomaly);
    }
}

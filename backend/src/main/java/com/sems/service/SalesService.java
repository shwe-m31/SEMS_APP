package com.sems.service;

import com.sems.entity.Sales;
import com.sems.repository.SalesRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class SalesService {
    
    private final SalesRepository salesRepository;
    
    public SalesService(SalesRepository salesRepository) {
        this.salesRepository = salesRepository;
    }
    
    public List<Sales> getSalesByBranch(Long branchId) {
        return salesRepository.findByBranchId(branchId);
    }
    
    public List<Sales> getSalesByBranchAndDateRange(Long branchId, LocalDate startDate, LocalDate endDate) {
        return salesRepository.findByBranchIdAndSaleDateBetween(branchId, startDate, endDate);
    }
    
    public List<Sales> getSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        return salesRepository.findBySaleDateBetween(startDate, endDate);
    }
    
    public BigDecimal getTotalSalesByBranch(Long branchId, LocalDate startDate, LocalDate endDate) {
        List<Sales> sales = salesRepository.findByBranchIdAndSaleDateBetween(branchId, startDate, endDate);
        return sales.stream()
            .map(Sales::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

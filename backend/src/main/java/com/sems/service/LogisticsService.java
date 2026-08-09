package com.sems.service;

import com.sems.entity.Logistics;
import com.sems.entity.Branch;
import com.sems.repository.LogisticsRepository;
import com.sems.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class LogisticsService {
    
    private final LogisticsRepository logisticsRepository;
    private final BranchRepository branchRepository;
    
    public LogisticsService(LogisticsRepository logisticsRepository, BranchRepository branchRepository) {
        this.logisticsRepository = logisticsRepository;
        this.branchRepository = branchRepository;
    }
    
    public List<Logistics> getLogisticsByBranch(Long branchId) {
        return logisticsRepository.findByBranchId(branchId);
    }
    
    public List<Logistics> getLogisticsByBranchAndStatus(Long branchId, Logistics.LogisticsStatus status) {
        return logisticsRepository.findByBranchIdAndStatus(branchId, status);
    }
    
    public Logistics getLogisticsById(Long id) {
        return logisticsRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Logistics createLogistics(Logistics logistics, Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        logistics.setBranch(branch);
        return logisticsRepository.save(logistics);
    }
    
    @Transactional
    public Logistics updateLogistics(Long id, Logistics logisticsDetails) {
        Logistics logistics = logisticsRepository.findById(id).orElse(null);
        if (logistics == null) return null;
        
        logistics.setItemName(logisticsDetails.getItemName());
        logistics.setSource(logisticsDetails.getSource());
        logistics.setDestination(logisticsDetails.getDestination());
        logistics.setQuantity(logisticsDetails.getQuantity());
        logistics.setUnit(logisticsDetails.getUnit());
        logistics.setStatus(logisticsDetails.getStatus());
        logistics.setExpectedDate(logisticsDetails.getExpectedDate());
        logistics.setActualDate(logisticsDetails.getActualDate());
        logistics.setNotes(logisticsDetails.getNotes());
        
        return logisticsRepository.save(logistics);
    }
    
    @Transactional
    public void deleteLogistics(Long id) {
        logisticsRepository.deleteById(id);
    }
}

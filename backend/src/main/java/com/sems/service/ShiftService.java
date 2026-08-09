package com.sems.service;

import com.sems.entity.Shift;
import com.sems.entity.Branch;
import com.sems.repository.ShiftRepository;
import com.sems.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class ShiftService {
    
    private final ShiftRepository shiftRepository;
    private final BranchRepository branchRepository;
    
    public ShiftService(ShiftRepository shiftRepository, BranchRepository branchRepository) {
        this.shiftRepository = shiftRepository;
        this.branchRepository = branchRepository;
    }
    
    public List<Shift> getShiftsByBranch(Long branchId) {
        return shiftRepository.findByBranchId(branchId);
    }
    
    public Shift getShiftById(Long id) {
        return shiftRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Shift createShift(Shift shift, Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        shift.setBranch(branch);
        return shiftRepository.save(shift);
    }
    
    @Transactional
    public Shift updateShift(Long id, Shift shiftDetails) {
        Shift shift = shiftRepository.findById(id).orElse(null);
        if (shift == null) return null;
        
        shift.setName(shiftDetails.getName());
        shift.setStartTime(shiftDetails.getStartTime());
        shift.setEndTime(shiftDetails.getEndTime());
        shift.setDescription(shiftDetails.getDescription());
        
        return shiftRepository.save(shift);
    }
    
    @Transactional
    public void deleteShift(Long id) {
        shiftRepository.deleteById(id);
    }
}

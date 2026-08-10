package com.sems.controller;

import com.sems.entity.Shift;
import com.sems.service.ShiftService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
    
    private final ShiftService shiftService;
    
    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Shift>> getShiftsByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(shiftService.getShiftsByBranch(branchId));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Shift> getShiftById(@PathVariable Long id) {
        Shift shift = shiftService.getShiftById(id);
        if (shift != null) {
            return ResponseEntity.ok(shift);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Shift> createShift(@RequestBody Map<String, Object> shiftData) {
        Shift shift = new Shift();
        shift.setName((String) shiftData.get("name"));
        shift.setStartTime(LocalTime.parse((String) shiftData.get("startTime")));
        shift.setEndTime(LocalTime.parse((String) shiftData.get("endTime")));
        shift.setDescription((String) shiftData.get("description"));
        
        Shift createdShift = shiftService.createShift(shift, Long.valueOf(shiftData.get("branchId").toString()));
        
        if (createdShift != null) {
            return ResponseEntity.ok(createdShift);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Shift> updateShift(@PathVariable Long id, @RequestBody Shift shift) {
        Shift updatedShift = shiftService.updateShift(id, shift);
        if (updatedShift != null) {
            return ResponseEntity.ok(updatedShift);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
        return ResponseEntity.ok().build();
    }
}

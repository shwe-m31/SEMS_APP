package com.sems.controller;

import com.sems.entity.Attendance;
import com.sems.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }
    
    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Attendance>> getAttendanceByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByWorker(workerId));
    }
    
    @GetMapping("/branch/{branchId}/{date}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Attendance>> getAttendanceByBranchAndDate(
            @PathVariable Long branchId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByBranchAndDate(branchId, date));
    }
    
    @GetMapping("/worker/{workerId}/{date}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Optional<Attendance>> getAttendanceByWorkerAndDate(
            @PathVariable Long workerId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByWorkerAndDate(workerId, date));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Attendance> markAttendance(@RequestBody Map<String, Object> attendanceData) {
        Attendance attendance = attendanceService.markAttendance(
            Long.valueOf(attendanceData.get("workerId").toString()),
            Long.valueOf(attendanceData.get("branchId").toString()),
            attendanceData.get("checkInTime") != null ? 
                LocalTime.parse(attendanceData.get("checkInTime").toString()) : LocalTime.now(),
            Attendance.AttendanceStatus.valueOf((String) attendanceData.get("status"))
        );
        
        if (attendance != null) {
            return ResponseEntity.ok(attendance);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id, @RequestBody Map<String, Object> attendanceData) {
        Attendance attendance = attendanceService.updateAttendance(
            id,
            attendanceData.get("checkOutTime") != null ? 
                LocalTime.parse(attendanceData.get("checkOutTime").toString()) : null,
            attendanceData.get("status") != null ? 
                Attendance.AttendanceStatus.valueOf((String) attendanceData.get("status")) : null
        );
        
        if (attendance != null) {
            return ResponseEntity.ok(attendance);
        }
        return ResponseEntity.notFound().build();
    }
}

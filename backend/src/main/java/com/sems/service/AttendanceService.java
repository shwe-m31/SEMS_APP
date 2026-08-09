package com.sems.service;

import com.sems.entity.Attendance;
import com.sems.entity.Worker;
import com.sems.entity.Branch;
import com.sems.repository.AttendanceRepository;
import com.sems.repository.WorkerRepository;
import com.sems.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final WorkerRepository workerRepository;
    private final BranchRepository branchRepository;
    
    public AttendanceService(AttendanceRepository attendanceRepository, WorkerRepository workerRepository,
                           BranchRepository branchRepository) {
        this.attendanceRepository = attendanceRepository;
        this.workerRepository = workerRepository;
        this.branchRepository = branchRepository;
    }
    
    public List<Attendance> getAttendanceByWorker(Long workerId) {
        return attendanceRepository.findByWorkerId(workerId);
    }
    
    public List<Attendance> getAttendanceByBranchAndDate(Long branchId, LocalDate date) {
        return attendanceRepository.findByBranchIdAndDate(branchId, date);
    }
    
    public Optional<Attendance> getAttendanceByWorkerAndDate(Long workerId, LocalDate date) {
        return attendanceRepository.findByWorkerIdAndDate(workerId, date);
    }
    
    @Transactional
    public Attendance markAttendance(Long workerId, Long branchId, LocalTime checkInTime, 
                                    Attendance.AttendanceStatus status) {
        Worker worker = workerRepository.findById(workerId).orElse(null);
        Branch branch = branchRepository.findById(branchId).orElse(null);
        
        if (worker == null || branch == null) return null;
        
        Attendance attendance = new Attendance();
        attendance.setWorker(worker);
        attendance.setBranch(branch);
        attendance.setDate(LocalDate.now());
        attendance.setCheckInTime(checkInTime);
        attendance.setStatus(status);
        
        return attendanceRepository.save(attendance);
    }
    
    @Transactional
    public Attendance updateAttendance(Long id, LocalTime checkOutTime, Attendance.AttendanceStatus status) {
        Attendance attendance = attendanceRepository.findById(id).orElse(null);
        if (attendance == null) return null;
        
        attendance.setCheckOutTime(checkOutTime);
        attendance.setStatus(status);
        
        return attendanceRepository.save(attendance);
    }
}

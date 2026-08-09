package com.sems.repository;

import com.sems.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByWorkerId(Long workerId);
    List<Attendance> findByBranchIdAndDate(Long branchId, LocalDate date);
    Optional<Attendance> findByWorkerIdAndDate(Long workerId, LocalDate date);
    List<Attendance> findByBranchIdAndDateBetween(Long branchId, LocalDate startDate, LocalDate endDate);
}

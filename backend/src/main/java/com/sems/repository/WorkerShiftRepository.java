package com.sems.repository;

import com.sems.entity.WorkerShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkerShiftRepository extends JpaRepository<WorkerShift, Long> {
    List<WorkerShift> findByWorkerId(Long workerId);
    List<WorkerShift> findByShiftId(Long shiftId);
    List<WorkerShift> findByDate(LocalDate date);
    List<WorkerShift> findByWorkerIdAndDate(Long workerId, LocalDate date);
    void deleteByWorkerIdAndShiftIdAndDate(Long workerId, Long shiftId, LocalDate date);
}

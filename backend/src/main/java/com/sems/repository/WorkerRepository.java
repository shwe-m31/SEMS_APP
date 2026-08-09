package com.sems.repository;

import com.sems.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByBranchId(Long branchId);
    Optional<Worker> findByUserId(Long userId);
    Optional<Worker> findByEmployeeId(String employeeId);
    List<Worker> findByBranchIdAndStatus(Long branchId, Worker.WorkerStatus status);
}

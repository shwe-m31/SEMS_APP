package com.sems.repository;

import com.sems.entity.Logistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogisticsRepository extends JpaRepository<Logistics, Long> {
    List<Logistics> findByBranchId(Long branchId);
    List<Logistics> findByBranchIdAndStatus(Long branchId, Logistics.LogisticsStatus status);
}

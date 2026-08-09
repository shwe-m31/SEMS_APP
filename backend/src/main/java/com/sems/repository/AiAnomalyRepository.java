package com.sems.repository;

import com.sems.entity.AiAnomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiAnomalyRepository extends JpaRepository<AiAnomaly, Long> {
    List<AiAnomaly> findByBranchId(Long branchId);
    List<AiAnomaly> findByBranchIdAndStatus(Long branchId, AiAnomaly.AnomalyStatus status);
    List<AiAnomaly> findByBranchIdAndSeverityGreaterThanEqual(Long branchId, AiAnomaly.AnomalySeverity severity);
}

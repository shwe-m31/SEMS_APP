package com.sems.repository;

import com.sems.entity.AiPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AiPredictionRepository extends JpaRepository<AiPrediction, Long> {
    List<AiPrediction> findByBranchId(Long branchId);
    List<AiPrediction> findByBranchIdAndPredictionType(Long branchId, AiPrediction.PredictionType type);
    List<AiPrediction> findByBranchIdAndPredictionDateBetween(Long branchId, LocalDate startDate, LocalDate endDate);
}

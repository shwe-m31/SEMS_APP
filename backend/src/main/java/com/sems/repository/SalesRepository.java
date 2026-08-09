package com.sems.repository;

import com.sems.entity.Sales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesRepository extends JpaRepository<Sales, Long> {
    List<Sales> findByBranchId(Long branchId);
    List<Sales> findByBranchIdAndSaleDateBetween(Long branchId, LocalDate startDate, LocalDate endDate);
    List<Sales> findBySaleDateBetween(LocalDate startDate, LocalDate endDate);
}

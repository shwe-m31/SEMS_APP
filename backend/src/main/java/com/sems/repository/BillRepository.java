package com.sems.repository;

import com.sems.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByBranchId(Long branchId);
    List<Bill> findByBranchIdAndCreatedAtBetween(Long branchId, LocalDate startDate, LocalDate endDate);
}

package com.sems.repository;

import com.sems.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByBranchId(Long branchId);
    List<Expense> findByBranchIdAndExpenseDateBetween(Long branchId, LocalDate startDate, LocalDate endDate);
}

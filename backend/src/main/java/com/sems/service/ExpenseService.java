package com.sems.service;

import com.sems.entity.Expense;
import com.sems.entity.Branch;
import com.sems.repository.ExpenseRepository;
import com.sems.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final BranchRepository branchRepository;
    
    public ExpenseService(ExpenseRepository expenseRepository, BranchRepository branchRepository) {
        this.expenseRepository = expenseRepository;
        this.branchRepository = branchRepository;
    }
    
    public List<Expense> getExpensesByBranch(Long branchId) {
        return expenseRepository.findByBranchId(branchId);
    }
    
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Expense createExpense(Expense expense, Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        expense.setBranch(branch);
        return expenseRepository.save(expense);
    }
    
    @Transactional
    public Expense updateExpense(Long id, Expense expenseDetails) {
        Expense expense = expenseRepository.findById(id).orElse(null);
        if (expense == null) return null;
        
        expense.setCategory(expenseDetails.getCategory());
        expense.setAmount(expenseDetails.getAmount());
        expense.setDescription(expenseDetails.getDescription());
        expense.setExpenseDate(expenseDetails.getExpenseDate());
        
        return expenseRepository.save(expense);
    }
    
    @Transactional
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
}

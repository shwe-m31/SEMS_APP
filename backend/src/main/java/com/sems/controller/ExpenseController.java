package com.sems.controller;

import com.sems.entity.Expense;
import com.sems.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    
    private final ExpenseService expenseService;
    
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Expense>> getExpensesByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(expenseService.getExpensesByBranch(branchId));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        Expense expense = expenseService.getExpenseById(id);
        if (expense != null) {
            return ResponseEntity.ok(expense);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Expense> createExpense(@RequestBody Map<String, Object> expenseData) {
        Expense expense = new Expense();
        expense.setCategory(Expense.ExpenseCategory.valueOf((String) expenseData.get("category")));
        expense.setAmount(new BigDecimal(expenseData.get("amount").toString()));
        expense.setDescription((String) expenseData.get("description"));
        expense.setExpenseDate(LocalDate.parse((String) expenseData.get("expenseDate")));
        
        Expense createdExpense = expenseService.createExpense(
            expense,
            Long.valueOf(expenseData.get("branchId").toString())
        );
        
        if (createdExpense != null) {
            return ResponseEntity.ok(createdExpense);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        Expense updatedExpense = expenseService.updateExpense(id, expense);
        if (updatedExpense != null) {
            return ResponseEntity.ok(updatedExpense);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }
}

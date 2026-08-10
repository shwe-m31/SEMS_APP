package com.sems.repository;

import com.sems.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByBranchId(Long branchId);
    List<Inventory> findByBranchIdAndCategory(Long branchId, Inventory.InventoryCategory category);
    
    @Query("SELECT i FROM Inventory i WHERE i.branch.id = :branchId AND i.quantity < i.minimumStockLevel")
    List<Inventory> findByBranchIdAndQuantityLessThanMinimumStockLevel(@Param("branchId") Long branchId);
}

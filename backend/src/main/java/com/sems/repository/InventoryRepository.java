package com.sems.repository;

import com.sems.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByBranchId(Long branchId);
    List<Inventory> findByBranchIdAndCategory(Long branchId, Inventory.InventoryCategory category);
    List<Inventory> findByBranchIdAndQuantityLessThanMinimumStockLevel(Long branchId);
}

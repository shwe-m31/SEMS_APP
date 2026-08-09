package com.sems.service;

import com.sems.entity.Inventory;
import com.sems.entity.Branch;
import com.sems.repository.InventoryRepository;
import com.sems.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {
    
    private final InventoryRepository inventoryRepository;
    private final BranchRepository branchRepository;
    
    public InventoryService(InventoryRepository inventoryRepository, BranchRepository branchRepository) {
        this.inventoryRepository = inventoryRepository;
        this.branchRepository = branchRepository;
    }
    
    public List<Inventory> getInventoryByBranch(Long branchId) {
        return inventoryRepository.findByBranchId(branchId);
    }
    
    public List<Inventory> getLowStockItems(Long branchId) {
        return inventoryRepository.findByBranchIdAndQuantityLessThanMinimumStockLevel(branchId);
    }
    
    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Inventory createInventory(Inventory inventory, Long branchId) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        inventory.setBranch(branch);
        inventory.setLastUpdated(LocalDateTime.now());
        return inventoryRepository.save(inventory);
    }
    
    @Transactional
    public Inventory updateInventory(Long id, Inventory inventoryDetails) {
        Inventory inventory = inventoryRepository.findById(id).orElse(null);
        if (inventory == null) return null;
        
        inventory.setName(inventoryDetails.getName());
        inventory.setCategory(inventoryDetails.getCategory());
        inventory.setQuantity(inventoryDetails.getQuantity());
        inventory.setUnit(inventoryDetails.getUnit());
        inventory.setMinimumStockLevel(inventoryDetails.getMinimumStockLevel());
        inventory.setSupplier(inventoryDetails.getSupplier());
        inventory.setLastUpdated(LocalDateTime.now());
        
        return inventoryRepository.save(inventory);
    }
    
    @Transactional
    public Inventory updateStock(Long id, BigDecimal quantityChange) {
        Inventory inventory = inventoryRepository.findById(id).orElse(null);
        if (inventory == null) return null;
        
        BigDecimal newQuantity = inventory.getQuantity().add(quantityChange);
        inventory.setQuantity(newQuantity);
        inventory.setLastUpdated(LocalDateTime.now());
        
        return inventoryRepository.save(inventory);
    }
    
    @Transactional
    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }
}

package com.sems.controller;

import com.sems.entity.Inventory;
import com.sems.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Inventory>> getInventoryByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(inventoryService.getInventoryByBranch(branchId));
    }
    
    @GetMapping("/low-stock/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Inventory>> getLowStockItems(@PathVariable Long branchId) {
        return ResponseEntity.ok(inventoryService.getLowStockItems(branchId));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
        Inventory inventory = inventoryService.getInventoryById(id);
        if (inventory != null) {
            return ResponseEntity.ok(inventory);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Inventory> createInventory(@RequestBody Map<String, Object> inventoryData) {
        Inventory inventory = new Inventory();
        inventory.setName((String) inventoryData.get("name"));
        inventory.setCategory(Inventory.InventoryCategory.valueOf((String) inventoryData.get("category")));
        inventory.setQuantity(new BigDecimal(inventoryData.get("quantity").toString()));
        inventory.setUnit((String) inventoryData.get("unit"));
        inventory.setMinimumStockLevel(new BigDecimal(inventoryData.get("minimumStockLevel").toString()));
        inventory.setSupplier((String) inventoryData.get("supplier"));
        
        Inventory createdInventory = inventoryService.createInventory(
            inventory,
            Long.valueOf(inventoryData.get("branchId").toString())
        );
        
        if (createdInventory != null) {
            return ResponseEntity.ok(createdInventory);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @RequestBody Inventory inventory) {
        Inventory updatedInventory = inventoryService.updateInventory(id, inventory);
        if (updatedInventory != null) {
            return ResponseEntity.ok(updatedInventory);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Inventory> updateStock(@PathVariable Long id, @RequestBody Map<String, Object> stockData) {
        Inventory updatedInventory = inventoryService.updateStock(
            id,
            new BigDecimal(stockData.get("quantityChange").toString())
        );
        if (updatedInventory != null) {
            return ResponseEntity.ok(updatedInventory);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.ok().build();
    }
}

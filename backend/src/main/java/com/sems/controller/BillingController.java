package com.sems.controller;

import com.sems.entity.Bill;
import com.sems.entity.BillItem;
import com.sems.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/billing")
public class BillingController {
    
    private final BillingService billingService;
    
    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Bill>> getBillsByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(billingService.getBillsByBranch(branchId));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        Bill bill = billingService.getBillById(id);
        if (bill != null) {
            return ResponseEntity.ok(bill);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Bill> createBill(@RequestBody Map<String, Object> billData) {
        Bill bill = new Bill();
        bill.setCustomerName((String) billData.get("customerName"));
        bill.setDiscount(new BigDecimal(billData.get("discount").toString()));
        bill.setTax(new BigDecimal(billData.get("tax").toString()));
        bill.setPaymentMethod((String) billData.get("paymentMethod"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) billData.get("items");
        
        List<BillItem> items = new ArrayList<>();
        for (Map<String, Object> itemData : itemsData) {
            BillItem item = new BillItem();
            item.setProductName((String) itemData.get("productName"));
            item.setQuantity(new BigDecimal(itemData.get("quantity").toString()));
            item.setPrice(new BigDecimal(itemData.get("price").toString()));
            items.add(item);
        }
        
        Bill createdBill = billingService.createBill(
            bill,
            Long.valueOf(billData.get("branchId").toString()),
            items
        );
        
        if (createdBill != null) {
            return ResponseEntity.ok(createdBill);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billingService.deleteBill(id);
        return ResponseEntity.ok().build();
    }
}

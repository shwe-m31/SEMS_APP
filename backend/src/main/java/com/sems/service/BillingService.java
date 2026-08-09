package com.sems.service;

import com.sems.entity.Bill;
import com.sems.entity.BillItem;
import com.sems.entity.Branch;
import com.sems.entity.Product;
import com.sems.entity.Sales;
import com.sems.entity.Inventory;
import com.sems.repository.BillRepository;
import com.sems.repository.BranchRepository;
import com.sems.repository.ProductRepository;
import com.sems.repository.SalesRepository;
import com.sems.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillingService {
    
    private final BillRepository billRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;
    private final SalesRepository salesRepository;
    private final InventoryRepository inventoryRepository;
    
    public BillingService(BillRepository billRepository, BranchRepository branchRepository,
                         ProductRepository productRepository, SalesRepository salesRepository,
                         InventoryRepository inventoryRepository) {
        this.billRepository = billRepository;
        this.branchRepository = branchRepository;
        this.productRepository = productRepository;
        this.salesRepository = salesRepository;
        this.inventoryRepository = inventoryRepository;
    }
    
    public List<Bill> getBillsByBranch(Long branchId) {
        return billRepository.findByBranchId(branchId);
    }
    
    public Bill getBillById(Long id) {
        return billRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Bill createBill(Bill bill, Long branchId, List<BillItem> items) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        if (branch == null) return null;
        
        bill.setBranch(branch);
        bill.setBillNumber("BILL-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis());
        
        BigDecimal subtotal = BigDecimal.ZERO;
        for (BillItem item : items) {
            item.setBill(bill);
            item.setTotal(item.getPrice().multiply(item.getQuantity()));
            subtotal = subtotal.add(item.getTotal());
            
            // Create sales record
            Sales sales = new Sales();
            sales.setBranch(branch);
            sales.setBill(bill);
            sales.setProduct(item.getProduct());
            sales.setProductName(item.getProductName());
            sales.setQuantity(item.getQuantity());
            sales.setAmount(item.getTotal());
            sales.setSaleDate(LocalDate.now());
            salesRepository.save(sales);
            
            // Update inventory
            if (item.getProduct() != null) {
                List<Inventory> inventories = inventoryRepository.findByBranchId(branchId);
                for (Inventory inv : inventories) {
                    if (inv.getName().equalsIgnoreCase(item.getProductName())) {
                        inv.setQuantity(inv.getQuantity().subtract(item.getQuantity()));
                        inventoryRepository.save(inv);
                        break;
                    }
                }
            }
        }
        
        bill.setSubtotal(subtotal);
        bill.setTotalAmount(subtotal.subtract(bill.getDiscount()).add(bill.getTax()));
        bill.setItems(items);
        
        return billRepository.save(bill);
    }
    
    @Transactional
    public void deleteBill(Long id) {
        billRepository.deleteById(id);
    }
}

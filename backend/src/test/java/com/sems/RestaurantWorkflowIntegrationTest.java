package com.sems;

import com.sems.dto.WorkerCreationRequest;
import com.sems.dto.WorkerCreationResponse;
import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.UserPrincipal;
import com.sems.service.DashboardService;
import com.sems.service.RestaurantOrderService;
import com.sems.service.WorkerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class RestaurantWorkflowIntegrationTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private WorkerService workerService;

    @Autowired
    private RestaurantOrderService orderService;

    @Autowired
    private com.sems.service.AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private RestaurantOrderRepository orderRepository;

    private void mockSecurityContext(User user) {
        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Complete Restaurant Workflow: Owner -> Admin -> Worker -> Order -> Inventory Deduction")
    @Transactional
    public void testFullRestaurantWorkflow() {
        // 1. Owner Telemetry & Admin Password Claim Verification
        User ownerUser = userRepository.findByEmail("owner@atoz.com").orElse(null);
        assertNotNull(ownerUser, "Owner user should exist in seeded database");
        mockSecurityContext(ownerUser);

        Map<String, Object> ownerDashboard = dashboardService.getOwnerDashboard();
        assertNotNull(ownerDashboard, "Owner dashboard should return data");
        assertTrue(ownerDashboard.containsKey("branches"), "Owner dashboard should contain branches");
        assertTrue(ownerDashboard.containsKey("topSellingItems"), "Owner dashboard should contain top-selling items");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> branchesList = (List<Map<String, Object>>) ownerDashboard.get("branches");
        assertFalse(branchesList.isEmpty(), "Branches list should not be empty");
        @SuppressWarnings("unchecked")
        Map<String, Object> firstAdminMap = (Map<String, Object>) branchesList.get(0).get("admin");
        assertNotNull(firstAdminMap, "First branch should have an assigned admin");
        assertNotNull(firstAdminMap.get("temporaryPassword"), "Admin password must be present on Owner Dashboard for claim");
        assertEquals("password123", firstAdminMap.get("temporaryPassword"), "Default seeded password must be claimable");

        // Verify Owner can reset Admin password when forgotten (test on Branch 2 admin)
        @SuppressWarnings("unchecked")
        Map<String, Object> secondAdminMap = (Map<String, Object>) branchesList.get(1).get("admin");
        assertNotNull(secondAdminMap, "Second branch should have an assigned admin");
        Long admin2Id = ((Number) secondAdminMap.get("id")).longValue();
        Map<String, Object> resetResult = adminService.resetAdminPassword(admin2Id);
        assertNotNull(resetResult.get("temporaryPassword"));
        String newAdminPassword = (String) resetResult.get("temporaryPassword");
        assertTrue(newAdminPassword.length() >= 8, "Reset password should be at least 8 characters");

        // Subsequent dashboard call reflects the newly claimed password
        Map<String, Object> refreshedDashboard = dashboardService.getOwnerDashboard();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> refreshedBranches = (List<Map<String, Object>>) refreshedDashboard.get("branches");
        @SuppressWarnings("unchecked")
        Map<String, Object> refreshedAdmin2Map = (Map<String, Object>) refreshedBranches.get(1).get("admin");
        assertEquals(newAdminPassword, refreshedAdmin2Map.get("temporaryPassword"), "Owner dashboard must reflect the reset password");

        // 2. Admin creates a new Worker (Branch 1: A2Z-ERD-001)
        User adminUser = userRepository.findByEmail("admin.erode@atoz.com").orElse(null);
        assertNotNull(adminUser, "Admin user should exist in seeded database");
        mockSecurityContext(adminUser);

        WorkerCreationRequest req = new WorkerCreationRequest();
        req.setName("Karthik Raman");
        req.setEmail("karthik.test@atoz.com");
        req.setPhone("9876543999");
        req.setDesignation("WAITER");
        req.setSalary(new BigDecimal("18000.00"));
        req.setHireDate("2026-03-01");

        WorkerCreationResponse workerResp = workerService.createWorkerWithCredentials(req);
        assertNotNull(workerResp);
        assertNotNull(workerResp.getWorker(), "Worker summary should be present");
        assertNotNull(workerResp.getWorker().getEmployeeId(), "Employee ID must be auto-generated");
        assertTrue(workerResp.getWorker().getEmployeeId().startsWith("A2Z-ERD-001-W"), "Employee ID must follow branch format");
        assertNotNull(workerResp.getWorker().getUsername(), "Username must be auto-generated");
        assertNotNull(workerResp.getTemporaryPassword(), "Temporary password must be returned once");
        assertEquals("WAITER", workerResp.getWorker().getDesignation());

        // 3. Waiter creates a Table Order
        User waiterUser = userRepository.findByUsername(workerResp.getWorker().getUsername()).orElse(null);
        assertNotNull(waiterUser);
        waiterUser.setMustChangePassword(false); // simulate password change completed
        userRepository.save(waiterUser);
        mockSecurityContext(waiterUser);

        // Fetch menu to find Chicken Biriyani (Product ID in seed)
        List<Product> menu = orderService.getMenuItems();
        assertFalse(menu.isEmpty(), "Menu should have items");
        Product biriyani = menu.stream()
                .filter(p -> p.getName().toLowerCase().contains("biriyani"))
                .findFirst()
                .orElse(menu.get(0));

        Map<String, Object> orderPayload = Map.of(
                "tableNumber", "Table 9",
                "customerName", "Special Guest",
                "notes", "Less spicy",
                "items", List.of(
                        Map.of("productId", biriyani.getId(), "quantity", 2)
                )
        );

        RestaurantOrder createdOrder = orderService.createOrder(orderPayload);
        assertNotNull(createdOrder);
        assertEquals(OrderStatus.CREATED, createdOrder.getStatus());
        assertEquals("Table 9", createdOrder.getTableNumber());
        assertEquals(1, createdOrder.getItems().size());
        assertEquals(2, createdOrder.getItems().get(0).getQuantity());

        // 4. Chef accepts and prepares order
        User chefUser = userRepository.findByUsername("rahul.erd").orElse(null);
        assertNotNull(chefUser);
        mockSecurityContext(chefUser);

        RestaurantOrder acceptedOrder = orderService.acceptOrder(createdOrder.getId());
        assertEquals(OrderStatus.ACCEPTED, acceptedOrder.getStatus());
        assertEquals(chefUser.getId(), acceptedOrder.getChef().getUser().getId());

        RestaurantOrder preparingOrder = orderService.startPreparation(createdOrder.getId());
        assertEquals(OrderStatus.PREPARING, preparingOrder.getStatus());

        RestaurantOrder readyOrder = orderService.markReady(createdOrder.getId());
        assertEquals(OrderStatus.READY, readyOrder.getStatus());

        // 5. Waiter serves order
        mockSecurityContext(waiterUser);
        RestaurantOrder servedOrder = orderService.serveOrder(createdOrder.getId());
        assertEquals(OrderStatus.SERVED, servedOrder.getStatus());
        assertEquals(waiterUser.getId(), servedOrder.getWaiter().getUser().getId());

        // 6. Record inventory stock before payment
        Branch branch = branchRepository.findByBranchCode("A2Z-ERD-001").orElse(null);
        assertNotNull(branch);
        List<Inventory> beforeInventory = inventoryRepository.findByBranchId(branch.getId());
        Map<String, BigDecimal> stockBefore = new java.util.HashMap<>();
        for (Inventory inv : beforeInventory) {
            stockBefore.put(inv.getName(), inv.getQuantity());
        }

        // 7. Cashier completes payment (UPI) & atomic inventory deduction executes
        User cashierUser = userRepository.findByUsername("priya.erd").orElse(null);
        assertNotNull(cashierUser);
        mockSecurityContext(cashierUser);

        RestaurantOrder completedOrder = orderService.completePayment(createdOrder.getId(), "UPI");
        assertEquals(OrderStatus.COMPLETED, completedOrder.getStatus());
        assertNotNull(completedOrder.getBill(), "Bill record must be created");
        assertEquals("UPI", completedOrder.getBill().getPaymentMethod());

        // 8. Verify Inventory Deduction
        List<Inventory> afterInventory = inventoryRepository.findByBranchId(branch.getId());
        boolean anyDeducted = false;
        for (Inventory inv : afterInventory) {
            BigDecimal beforeQty = stockBefore.get(inv.getName());
            if (beforeQty != null && inv.getQuantity().compareTo(beforeQty) < 0) {
                anyDeducted = true;
                System.out.println("Verified Inventory Deduction for " + inv.getName() +
                        ": Before = " + beforeQty + ", After = " + inv.getQuantity());
            }
        }
        assertTrue(anyDeducted, "Inventory ingredients should be deducted after payment completion");

        // 9. Worker reports an issue
        mockSecurityContext(waiterUser);
        WorkerIssue reportedIssue = orderService.reportIssue("EQUIPMENT_MALFUNCTION", "POS handheld terminal battery depleted");
        assertNotNull(reportedIssue);
        assertEquals("OPEN", reportedIssue.getStatus());
        assertEquals("EQUIPMENT_MALFUNCTION", reportedIssue.getCategory());

        // 10. Admin checks telemetry & sees reported issue
        mockSecurityContext(adminUser);
        Map<String, Object> adminDashboard = dashboardService.getAdminDashboard();
        assertNotNull(adminDashboard);
        assertTrue((Long) adminDashboard.get("todayOrders") > 0);
        assertTrue((Long) adminDashboard.get("openIssues") > 0);
    }
}

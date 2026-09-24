package com.sems.service;

import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RestaurantOrderService {

    private final RestaurantOrderRepository orderRepository;
    private final RestaurantOrderItemRepository orderItemRepository;
    private final RecipeItemRepository recipeItemRepository;
    private final WorkerIssueRepository issueRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final BillRepository billRepository;
    private final SalesRepository salesRepository;
    private final WorkerRepository workerRepository;
    private final AdminRepository adminRepository;
    private final BranchRepository branchRepository;
    private final OrganizationRepository organizationRepository;
    private final NotificationRepository notificationRepository;

    public RestaurantOrderService(RestaurantOrderRepository orderRepository,
                                  RestaurantOrderItemRepository orderItemRepository,
                                  RecipeItemRepository recipeItemRepository,
                                  WorkerIssueRepository issueRepository,
                                  ProductRepository productRepository,
                                  InventoryRepository inventoryRepository,
                                  BillRepository billRepository,
                                  SalesRepository salesRepository,
                                  WorkerRepository workerRepository,
                                  AdminRepository adminRepository,
                                  BranchRepository branchRepository,
                                  OrganizationRepository organizationRepository,
                                  NotificationRepository notificationRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.recipeItemRepository = recipeItemRepository;
        this.issueRepository = issueRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.billRepository = billRepository;
        this.salesRepository = salesRepository;
        this.workerRepository = workerRepository;
        this.adminRepository = adminRepository;
        this.branchRepository = branchRepository;
        this.organizationRepository = organizationRepository;
        this.notificationRepository = notificationRepository;
    }

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up;
        }
        return null;
    }

    private Branch resolveCallerBranch() {
        UserPrincipal up = getCurrentUser();
        if (up == null) return null;

        // Check if Admin
        Admin admin = adminRepository.findByUserId(up.getId()).orElse(null);
        if (admin != null) return admin.getBranch();

        // Check if Worker
        Worker worker = workerRepository.findByUserId(up.getId()).orElse(null);
        if (worker != null) return worker.getBranch();

        return null;
    }

    private Worker getCurrentWorker() {
        UserPrincipal up = getCurrentUser();
        if (up == null) return null;
        return workerRepository.findByUserId(up.getId()).orElse(null);
    }

    public List<RestaurantOrder> getOrders() {
        Branch branch = resolveCallerBranch();
        if (branch != null) {
            return orderRepository.findByBranchIdOrderByCreatedAtDesc(branch.getId());
        }

        // If Owner, return orders across all branches of organization
        UserPrincipal up = getCurrentUser();
        if (up != null) {
            List<Organization> orgs = organizationRepository.findByOwnerId(up.getId());
            if (!orgs.isEmpty()) {
                List<Branch> branches = branchRepository.findByOrganizationId(orgs.get(0).getId());
                List<RestaurantOrder> allOrders = new ArrayList<>();
                for (Branch b : branches) {
                    allOrders.addAll(orderRepository.findByBranchIdOrderByCreatedAtDesc(b.getId()));
                }
                return allOrders;
            }
        }
        return Collections.emptyList();
    }

    public List<Product> getMenuItems() {
        Branch branch = resolveCallerBranch();
        if (branch != null) {
            return productRepository.findByBranchId(branch.getId());
        }
        return productRepository.findAll();
    }

    @Transactional
    public RestaurantOrder createOrder(Map<String, Object> payload) {
        Branch branch = resolveCallerBranch();
        if (branch == null) {
            // Check if Owner specified branchId
            UserPrincipal up = getCurrentUser();
            if (up != null && payload.get("branchId") != null) {
                Long bId = Long.valueOf(payload.get("branchId").toString());
                branch = branchRepository.findById(bId).orElse(null);
            }
        }

        if (branch == null) {
            throw new AccessDeniedException("Branch could not be determined for order creation");
        }

        String tableNumber = payload.get("tableNumber") != null ? payload.get("tableNumber").toString() : "Table 1";
        String customerName = payload.get("customerName") != null ? payload.get("customerName").toString() : "Walk-in Guest";
        String notes = payload.get("notes") != null ? payload.get("notes").toString() : "";

        RestaurantOrder order = new RestaurantOrder();
        order.setBranch(branch);
        order.setTableNumber(tableNumber);
        order.setCustomerName(customerName);
        order.setNotes(notes);
        order.setStatus(OrderStatus.CREATED);

        // Generate Order Number
        String orderNumber = String.format("ORD-%d-%04d", LocalDate.now().getYear(), System.currentTimeMillis() % 10000);
        order.setOrderNumber(orderNumber);

        // Assign Waiter if created by waiter
        Worker currentWorker = getCurrentWorker();
        if (currentWorker != null && WorkerDesignation.WAITER.name().equalsIgnoreCase(currentWorker.getDesignation())) {
            order.setWaiter(currentWorker);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
        if (itemsList == null || itemsList.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<RestaurantOrderItem> orderItems = new ArrayList<>();

        for (Map<String, Object> itemData : itemsList) {
            Long productId = itemData.get("productId") != null ? Long.valueOf(itemData.get("productId").toString()) : null;
            String itemName = itemData.get("name") != null ? itemData.get("name").toString() : "Item";
            int quantity = itemData.get("quantity") != null ? Integer.parseInt(itemData.get("quantity").toString()) : 1;
            BigDecimal price = itemData.get("price") != null ? new BigDecimal(itemData.get("price").toString()) : BigDecimal.ZERO;

            Product product = null;
            if (productId != null) {
                product = productRepository.findById(productId).orElse(null);
                if (product != null) {
                    price = product.getPrice();
                    itemName = product.getName();
                }
            }

            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(itemTotal);

            RestaurantOrderItem orderItem = new RestaurantOrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setMenuItemName(itemName);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(price);
            orderItem.setTotalPrice(itemTotal);

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        RestaurantOrder savedOrder = orderRepository.save(order);

        // Notify Chefs & Admins in this branch
        notifyBranchStaff(branch, Notification.NotificationType.ORDER_CREATED,
                "New Order: " + orderNumber,
                "Table " + tableNumber + " placed order with " + orderItems.size() + " items (₹" + totalAmount + ")");

        return savedOrder;
    }

    @Transactional
    public RestaurantOrder acceptOrder(Long orderId) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Worker worker = getCurrentWorker();
        if (worker != null) {
            order.setChef(worker);
        }
        order.setStatus(OrderStatus.ACCEPTED);
        return orderRepository.save(order);
    }

    @Transactional
    public RestaurantOrder startPreparation(Long orderId) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Worker worker = getCurrentWorker();
        if (worker != null && order.getChef() == null) {
            order.setChef(worker);
        }
        order.setStatus(OrderStatus.PREPARING);
        return orderRepository.save(order);
    }

    @Transactional
    public RestaurantOrder markReady(Long orderId) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        order.setStatus(OrderStatus.READY);
        RestaurantOrder saved = orderRepository.save(order);

        // Notify Waiters & Admin
        notifyBranchStaff(order.getBranch(), Notification.NotificationType.ORDER_READY,
                "Order Ready: " + order.getOrderNumber(),
                order.getTableNumber() + " is prepared and ready for service.");

        return saved;
    }

    @Transactional
    public RestaurantOrder serveOrder(Long orderId) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Worker worker = getCurrentWorker();
        if (worker != null) {
            order.setWaiter(worker);
        }
        order.setStatus(OrderStatus.SERVED);
        RestaurantOrder saved = orderRepository.save(order);

        // Notify Cashiers & Admin
        notifyBranchStaff(order.getBranch(), Notification.NotificationType.ORDER_SERVED,
                "Order Served: " + order.getOrderNumber(),
                order.getTableNumber() + " has been served. Ready for billing.");

        return saved;
    }

    @Transactional
    public RestaurantOrder completePayment(Long orderId, String paymentMethod) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Branch branch = order.getBranch();
        Worker cashierWorker = getCurrentWorker();
        if (cashierWorker != null) {
            order.setCashier(cashierWorker);
        }

        String finalPaymentMethod = (paymentMethod != null && !paymentMethod.trim().isEmpty())
                ? paymentMethod.trim().toUpperCase() : "CASH";

        // 1. Create Bill & BillItems
        Bill bill = new Bill();
        bill.setBranch(branch);
        bill.setBillNumber("BILL-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis() % 100000);
        bill.setCustomerName(order.getCustomerName() != null ? order.getCustomerName() : order.getTableNumber());
        bill.setPaymentMethod(finalPaymentMethod);
        if (cashierWorker != null && cashierWorker.getUser() != null) {
            bill.setCreatedBy(cashierWorker.getUser().getId());
        }

        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP); // 5% GST
        BigDecimal totalAmount = subtotal.add(tax);

        bill.setSubtotal(subtotal);
        bill.setTax(tax);
        bill.setDiscount(BigDecimal.ZERO);
        bill.setTotalAmount(totalAmount);

        List<BillItem> billItems = new ArrayList<>();
        for (RestaurantOrderItem oi : order.getItems()) {
            BillItem bi = new BillItem();
            bi.setBill(bill);
            bi.setProduct(oi.getProduct());
            bi.setProductName(oi.getMenuItemName());
            bi.setQuantity(BigDecimal.valueOf(oi.getQuantity()));
            bi.setPrice(oi.getUnitPrice());
            bi.setTotal(oi.getTotalPrice());
            billItems.add(bi);
        }
        bill.setItems(billItems);
        Bill savedBill = billRepository.save(bill);

        for (RestaurantOrderItem oi : order.getItems()) {
            // 2. Create Sales record
            Sales sale = new Sales();
            sale.setBranch(branch);
            sale.setBill(savedBill);
            sale.setProduct(oi.getProduct());
            sale.setProductName(oi.getMenuItemName());
            sale.setQuantity(BigDecimal.valueOf(oi.getQuantity()));
            sale.setAmount(oi.getTotalPrice());
            sale.setSaleDate(LocalDate.now());
            salesRepository.save(sale);

            // 3. RECIPE-DRIVEN INVENTORY DEDUCTION (Transactional)
            if (oi.getProduct() != null) {
                List<RecipeItem> recipes = recipeItemRepository.findByProductId(oi.getProduct().getId());
                if (!recipes.isEmpty()) {
                    for (RecipeItem recipe : recipes) {
                        BigDecimal deductQuantity = recipe.getQuantityPerUnit()
                                .multiply(BigDecimal.valueOf(oi.getQuantity()));

                        Inventory inv = recipe.getInventoryItem();
                        if (inv != null) {
                            BigDecimal current = inv.getQuantity() != null ? inv.getQuantity() : BigDecimal.ZERO;
                            inv.setQuantity(current.subtract(deductQuantity));
                            inv.setLastUpdated(LocalDateTime.now());
                            inventoryRepository.save(inv);
                        }
                    }
                } else {
                    // Fallback to direct inventory name match
                    List<Inventory> inventories = inventoryRepository.findByBranchId(branch.getId());
                    for (Inventory inv : inventories) {
                        if (inv.getName().equalsIgnoreCase(oi.getMenuItemName())) {
                            BigDecimal current = inv.getQuantity() != null ? inv.getQuantity() : BigDecimal.ZERO;
                            inv.setQuantity(current.subtract(BigDecimal.valueOf(oi.getQuantity())));
                            inv.setLastUpdated(LocalDateTime.now());
                            inventoryRepository.save(inv);
                            break;
                        }
                    }
                }
            }
        }

        // 4. Update order
        order.setBill(savedBill);
        order.setStatus(OrderStatus.COMPLETED);
        RestaurantOrder savedOrder = orderRepository.save(order);

        // 5. Notify Staff
        notifyBranchStaff(branch, Notification.NotificationType.ORDER_COMPLETED,
                "Payment Received: " + order.getOrderNumber(),
                order.getTableNumber() + " paid ₹" + totalAmount + " via " + finalPaymentMethod);

        return savedOrder;
    }

    @Transactional
    public WorkerIssue reportIssue(String category, String description) {
        Worker worker = getCurrentWorker();
        if (worker == null) {
            throw new AccessDeniedException("Only workers can submit worker issues");
        }

        WorkerIssue issue = new WorkerIssue();
        issue.setWorker(worker);
        issue.setBranch(worker.getBranch());
        issue.setCategory(category != null ? category : "Other");
        issue.setDescription(description);
        issue.setStatus("OPEN");
        WorkerIssue savedIssue = issueRepository.save(issue);

        // Create alert for branch Admin
        notifyBranchStaff(worker.getBranch(), Notification.NotificationType.WORKER_ISSUE,
                "Worker Incident: " + issue.getCategory(),
                worker.getUser().getName() + " (" + worker.getDesignation() + "): " + description);

        return savedIssue;
    }

    public List<WorkerIssue> getBranchIssues() {
        Branch branch = resolveCallerBranch();
        if (branch != null) {
            return issueRepository.findByBranchIdOrderByCreatedAtDesc(branch.getId());
        }
        return Collections.emptyList();
    }

    private void notifyBranchStaff(Branch branch, Notification.NotificationType type, String title, String message) {
        try {
            // Find all users in this branch (Admins and Workers)
            List<Admin> admins = adminRepository.findByBranchId(branch.getId());
            for (Admin admin : admins) {
                if (admin.getUser() != null) {
                    Notification n = new Notification();
                    n.setUser(admin.getUser());
                    n.setBranch(branch);
                    n.setType(type);
                    n.setTitle(title);
                    n.setMessage(message);
                    n.setIsRead(false);
                    notificationRepository.save(n);
                }
            }
        } catch (Exception e) {
            // Log and continue without failing primary transaction
            System.err.println("Could not create notification: " + e.getMessage());
        }
    }
}

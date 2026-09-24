package com.sems.controller;

import com.sems.entity.Product;
import com.sems.entity.RestaurantOrder;
import com.sems.entity.WorkerIssue;
import com.sems.service.RestaurantOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurant")
public class RestaurantOrderController {

    private final RestaurantOrderService orderService;

    public RestaurantOrderController(RestaurantOrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<RestaurantOrder>> getOrders() {
        return ResponseEntity.ok(orderService.getOrders());
    }

    @GetMapping("/menu")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Product>> getMenuItems() {
        return ResponseEntity.ok(orderService.getMenuItems());
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            RestaurantOrder order = orderService.createOrder(payload);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/accept")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<?> acceptOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.acceptOrder(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/start")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<?> startPreparation(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.startPreparation(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/ready")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<?> markReady(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.markReady(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/serve")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<?> serveOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.serveOrder(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/pay")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<?> completePayment(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String paymentMethod = payload != null && payload.containsKey("paymentMethod")
                    ? payload.get("paymentMethod") : "CASH";
            return ResponseEntity.ok(orderService.completePayment(id, paymentMethod));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/issues")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<?> reportIssue(@RequestBody Map<String, String> payload) {
        try {
            String category = payload.get("category");
            String description = payload.get("description");
            WorkerIssue issue = orderService.reportIssue(category, description);
            return ResponseEntity.ok(issue);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/issues")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<WorkerIssue>> getBranchIssues() {
        return ResponseEntity.ok(orderService.getBranchIssues());
    }
}

package com.sems.repository;

import com.sems.entity.OrderStatus;
import com.sems.entity.RestaurantOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {

    List<RestaurantOrder> findByBranchIdOrderByCreatedAtDesc(Long branchId);

    List<RestaurantOrder> findByBranchIdAndStatusOrderByCreatedAtDesc(Long branchId, OrderStatus status);

    List<RestaurantOrder> findByBranchIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long branchId, LocalDateTime start, LocalDateTime end);

    List<RestaurantOrder> findByChefIdOrderByCreatedAtDesc(Long chefId);

    List<RestaurantOrder> findByWaiterIdOrderByCreatedAtDesc(Long waiterId);

    Optional<RestaurantOrder> findByOrderNumber(String orderNumber);

    long countByBranchIdAndStatus(Long branchId, OrderStatus status);

    long countByBranchIdAndCreatedAtBetween(Long branchId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(o) FROM RestaurantOrder o WHERE o.branch.id = :branchId AND o.createdAt >= :since")
    long countTodayOrders(@Param("branchId") Long branchId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(o) FROM RestaurantOrder o WHERE o.branch.organization.id = :orgId AND o.createdAt >= :since")
    long countTodayOrdersByOrganization(@Param("orgId") Long orgId, @Param("since") LocalDateTime since);
}

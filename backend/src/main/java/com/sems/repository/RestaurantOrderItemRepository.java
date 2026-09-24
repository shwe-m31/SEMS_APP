package com.sems.repository;

import com.sems.entity.RestaurantOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface RestaurantOrderItemRepository extends JpaRepository<RestaurantOrderItem, Long> {

    List<RestaurantOrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.menuItemName as name, SUM(oi.quantity) as count, SUM(oi.totalPrice) as revenue " +
           "FROM RestaurantOrderItem oi WHERE oi.order.branch.id = :branchId " +
           "GROUP BY oi.menuItemName ORDER BY count DESC")
    List<Map<String, Object>> findTopSellingItemsByBranch(@Param("branchId") Long branchId);

    @Query("SELECT oi.menuItemName as name, SUM(oi.quantity) as count, SUM(oi.totalPrice) as revenue " +
           "FROM RestaurantOrderItem oi WHERE oi.order.branch.organization.id = :orgId " +
           "GROUP BY oi.menuItemName ORDER BY count DESC")
    List<Map<String, Object>> findTopSellingItemsByOrganization(@Param("orgId") Long orgId);
}

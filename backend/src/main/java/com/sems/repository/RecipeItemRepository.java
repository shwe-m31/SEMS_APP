package com.sems.repository;

import com.sems.entity.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeItemRepository extends JpaRepository<RecipeItem, Long> {

    List<RecipeItem> findByProductId(Long productId);

    List<RecipeItem> findByProductBranchId(Long branchId);
}

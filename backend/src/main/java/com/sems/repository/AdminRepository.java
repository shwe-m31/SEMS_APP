package com.sems.repository;

import com.sems.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    List<Admin> findByBranchId(Long branchId);
    Optional<Admin> findByUserId(Long userId);
}

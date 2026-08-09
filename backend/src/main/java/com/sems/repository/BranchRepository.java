package com.sems.repository;

import com.sems.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByOrganizationId(Long organizationId);
    List<Branch> findByIdIn(List<Long> branchIds);
}

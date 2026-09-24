package com.sems.repository;

import com.sems.entity.WorkerIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerIssueRepository extends JpaRepository<WorkerIssue, Long> {

    List<WorkerIssue> findByBranchIdOrderByCreatedAtDesc(Long branchId);

    List<WorkerIssue> findByWorkerIdOrderByCreatedAtDesc(Long workerId);

    long countByBranchIdAndStatus(Long branchId, String status);
}

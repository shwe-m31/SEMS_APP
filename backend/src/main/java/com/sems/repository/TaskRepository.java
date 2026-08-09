package com.sems.repository;

import com.sems.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBranchId(Long branchId);
    List<Task> findByAssignedToId(Long workerId);
    List<Task> findByBranchIdAndStatus(Long branchId, Task.TaskStatus status);
    List<Task> findByAssignedToIdAndStatus(Long workerId, Task.TaskStatus status);
}

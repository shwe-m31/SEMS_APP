package com.sems.service;

import com.sems.entity.Task;
import com.sems.entity.Worker;
import com.sems.entity.Admin;
import com.sems.entity.Branch;
import com.sems.repository.TaskRepository;
import com.sems.repository.WorkerRepository;
import com.sems.repository.AdminRepository;
import com.sems.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final WorkerRepository workerRepository;
    private final AdminRepository adminRepository;
    private final BranchRepository branchRepository;
    
    public TaskService(TaskRepository taskRepository, WorkerRepository workerRepository,
                      AdminRepository adminRepository, BranchRepository branchRepository) {
        this.taskRepository = taskRepository;
        this.workerRepository = workerRepository;
        this.adminRepository = adminRepository;
        this.branchRepository = branchRepository;
    }
    
    public List<Task> getTasksByBranch(Long branchId) {
        return taskRepository.findByBranchId(branchId);
    }
    
    public List<Task> getTasksByWorker(Long workerId) {
        return taskRepository.findByAssignedToId(workerId);
    }
    
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Task createTask(Task task, Long branchId, Long assignedToId, Long assignedById) {
        Branch branch = branchRepository.findById(branchId).orElse(null);
        Worker assignedTo = assignedToId != null ? workerRepository.findById(assignedToId).orElse(null) : null;
        Admin assignedBy = adminRepository.findById(assignedById).orElse(null);
        
        if (branch == null || assignedBy == null) return null;
        
        task.setBranch(branch);
        task.setAssignedTo(assignedTo);
        task.setAssignedBy(assignedBy);
        
        return taskRepository.save(task);
    }
    
    @Transactional
    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null) return null;
        
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setPriority(taskDetails.getPriority());
        task.setStatus(taskDetails.getStatus());
        task.setDueDate(taskDetails.getDueDate());
        
        return taskRepository.save(task);
    }
    
    @Transactional
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}

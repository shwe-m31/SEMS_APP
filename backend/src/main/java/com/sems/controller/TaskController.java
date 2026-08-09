package com.sems.controller;

import com.sems.entity.Task;
import com.sems.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    
    private final TaskService taskService;
    
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }
    
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<Task>> getTasksByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(taskService.getTasksByBranch(branchId));
    }
    
    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<Task>> getTasksByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(taskService.getTasksByWorker(workerId));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        if (task != null) {
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody Map<String, Object> taskData) {
        Task task = new Task();
        task.setTitle((String) taskData.get("title"));
        task.setDescription((String) taskData.get("description"));
        task.setPriority(Task.Priority.valueOf((String) taskData.get("priority")));
        task.setStatus(Task.TaskStatus.valueOf((String) taskData.get("status")));
        
        if (taskData.get("dueDate") != null) {
            task.setDueDate(java.time.LocalDate.parse((String) taskData.get("dueDate")));
        }
        
        Task createdTask = taskService.createTask(
            task,
            Long.valueOf(taskData.get("branchId").toString()),
            taskData.get("assignedToId") != null ? Long.valueOf(taskData.get("assignedToId").toString()) : null,
            Long.valueOf(taskData.get("assignedById").toString())
        );
        
        if (createdTask != null) {
            return ResponseEntity.ok(createdTask);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        Task updatedTask = taskService.updateTask(id, task);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}

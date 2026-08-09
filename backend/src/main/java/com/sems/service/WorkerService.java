package com.sems.service;

import com.sems.entity.User;
import com.sems.entity.Worker;
import com.sems.entity.Branch;
import com.sems.repository.WorkerRepository;
import com.sems.repository.UserRepository;
import com.sems.repository.BranchRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WorkerService {
    
    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    
    public WorkerService(WorkerRepository workerRepository, UserRepository userRepository,
                        BranchRepository branchRepository, PasswordEncoder passwordEncoder) {
        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public List<Worker> getWorkersByBranch(Long branchId) {
        return workerRepository.findByBranchId(branchId);
    }
    
    public Worker getWorkerById(Long id) {
        return workerRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Worker createWorker(Worker worker, String email, String password, String name) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setRole(User.Role.WORKER);
        User savedUser = userRepository.save(user);
        
        worker.setUser(savedUser);
        return workerRepository.save(worker);
    }
    
    @Transactional
    public Worker updateWorker(Long id, Worker workerDetails) {
        Worker worker = workerRepository.findById(id).orElse(null);
        if (worker == null) return null;
        
        worker.setEmployeeId(workerDetails.getEmployeeId());
        worker.setDesignation(workerDetails.getDesignation());
        worker.setSalary(workerDetails.getSalary());
        worker.setHireDate(workerDetails.getHireDate());
        worker.setStatus(workerDetails.getStatus());
        
        return workerRepository.save(worker);
    }
    
    @Transactional
    public void deleteWorker(Long id) {
        workerRepository.deleteById(id);
    }
}

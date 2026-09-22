package com.sems.service;

import com.sems.entity.Admin;
import com.sems.entity.Branch;
import com.sems.entity.Organization;
import com.sems.entity.User;
import com.sems.entity.Worker;
import com.sems.repository.AdminRepository;
import com.sems.repository.BranchRepository;
import com.sems.repository.OrganizationRepository;
import com.sems.repository.UserRepository;
import com.sems.repository.WorkerRepository;
import com.sems.security.UserPrincipal;
import com.sems.util.PasswordGenerator;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkerService {
    
    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final AdminRepository adminRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;
    
    public WorkerService(WorkerRepository workerRepository, UserRepository userRepository,
                         BranchRepository branchRepository, AdminRepository adminRepository,
                         OrganizationRepository organizationRepository, PasswordEncoder passwordEncoder,
                         PasswordGenerator passwordGenerator) {
        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.adminRepository = adminRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordGenerator = passwordGenerator;
    }
    
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getId();
        }
        return null;
    }
    
    public List<Worker> getWorkersByBranch(Long branchId) {
        return workerRepository.findByBranchId(branchId);
    }
    
    public Worker getWorkerById(Long id) {
        return workerRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Worker createWorker(Worker worker, String email, String password, String name) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        Long currentUserId = userPrincipal.getId();

        Branch targetBranch = null;

        // Check if creator is ADMIN
        Admin admin = adminRepository.findByUserId(currentUserId).orElse(null);
        if (admin != null) {
            // Admin must create workers ONLY under their own assigned branch
            targetBranch = admin.getBranch();
        } else {
            // Check if creator is OWNER
            List<Organization> orgs = organizationRepository.findByOwnerId(currentUserId);
            if (!orgs.isEmpty()) {
                if (worker.getBranch() != null && worker.getBranch().getId() != null) {
                    Branch b = branchRepository.findById(worker.getBranch().getId()).orElse(null);
                    if (b != null && b.getOrganization().getId().equals(orgs.get(0).getId())) {
                        targetBranch = b;
                    }
                }
            }
        }

        if (targetBranch == null) {
            throw new AccessDeniedException("Unauthorized: Cannot assign worker to specified branch");
        }

        String finalPassword = (password != null && !password.trim().isEmpty())
                ? password.trim()
                : passwordGenerator.generateTemporaryPassword();

        String workerUsername = generateWorkerUsername(
                worker.getEmployeeId() != null ? worker.getEmployeeId() : name,
                targetBranch.getBranchCode()
        );

        User user = new User();
        user.setUsername(workerUsername);
        user.setEmail(email != null && !email.trim().isEmpty() ? email.trim().toLowerCase() : workerUsername + "@sems.local");
        user.setPassword(passwordEncoder.encode(finalPassword));
        user.setName(name != null ? name.trim() : "Worker");
        user.setRole(User.Role.WORKER);
        user.setMustChangePassword(true);
        User savedUser = userRepository.save(user);
        
        worker.setUser(savedUser);
        worker.setBranch(targetBranch);
        
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

    private String generateWorkerUsername(String identifier, String branchCode) {
        String base = (identifier != null ? identifier.toLowerCase().replaceAll("[^a-z0-9]", "") : "worker");
        if (base.isEmpty()) base = "worker";
        String suffix = (branchCode != null ? branchCode.toLowerCase().replace("-", "") : "");
        String username = base + "_" + suffix;
        if (username.length() > 50) username = username.substring(0, 50);

        int counter = 1;
        String candidate = username;
        while (userRepository.existsByUsername(candidate)) {
            candidate = username + counter++;
        }
        return candidate;
    }
}

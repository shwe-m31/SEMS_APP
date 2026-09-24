package com.sems.service;

import com.sems.dto.WorkerCreationRequest;
import com.sems.dto.WorkerCreationResponse;
import com.sems.entity.*;
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

import java.time.LocalDate;
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
    public WorkerCreationResponse createWorkerWithCredentials(WorkerCreationRequest request) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        Branch targetBranch = resolveTargetBranch(currentUserId, request.getBranchId());
        if (targetBranch == null) {
            throw new AccessDeniedException("Unauthorized: Cannot assign worker to specified branch");
        }

        // 1. Generate unique Employee ID (e.g. A2Z-ERD-W001)
        String employeeId = generateUniqueEmployeeId(targetBranch);

        // 2. Generate unique Username (e.g. rahul.a2zerd)
        String workerUsername = generateWorkerUsername(request.getName(), targetBranch.getBranchCode());

        // 3. Normalize Designation
        WorkerDesignation designation = WorkerDesignation.fromString(request.getDesignation());
        String designationStr = designation != null ? designation.name() : (request.getDesignation() != null ? request.getDesignation().trim() : "WORKER");

        // 4. Generate temporary password & hash
        String temporaryPassword = passwordGenerator.generateTemporaryPassword();

        // 5. Create and save User
        User user = new User();
        user.setUsername(workerUsername);
        String email = (request.getEmail() != null && !request.getEmail().trim().isEmpty())
                ? request.getEmail().trim().toLowerCase()
                : workerUsername + "@" + (targetBranch.getBranchCode() != null ? targetBranch.getBranchCode().toLowerCase().replace("-", "") : "sems") + ".local";

        // Avoid duplicate email collision if auto-generated
        if (userRepository.existsByEmail(email)) {
            email = workerUsername + "_" + System.currentTimeMillis() + "@sems.local";
        }

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setName(request.getName() != null ? request.getName().trim() : "Worker");
        user.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth().trim()));
        }
        user.setGender(request.getGender());
        user.setRole(User.Role.WORKER);
        user.setMustChangePassword(true);
        User savedUser = userRepository.save(user);

        // 6. Create and save Worker
        Worker worker = new Worker();
        worker.setUser(savedUser);
        worker.setBranch(targetBranch);
        worker.setEmployeeId(employeeId);
        worker.setDesignation(designationStr);
        worker.setSalary(request.getSalary());
        if (request.getHireDate() != null && !request.getHireDate().trim().isEmpty()) {
            worker.setHireDate(LocalDate.parse(request.getHireDate().trim()));
        } else {
            worker.setHireDate(LocalDate.now());
        }
        worker.setStatus(Worker.WorkerStatus.ACTIVE);

        Worker savedWorker = workerRepository.save(worker);

        return new WorkerCreationResponse(
                true,
                "Worker created successfully",
                WorkerCreationResponse.WorkerSummary.fromWorker(savedWorker),
                temporaryPassword
        );
    }

    @Transactional
    public WorkerCreationResponse resetWorkerPassword(Long workerId) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new IllegalArgumentException("Worker not found"));

        // Validate authorization: caller must be Admin of worker's branch or Owner of the organization
        Branch workerBranch = worker.getBranch();
        Admin admin = adminRepository.findByUserId(currentUserId).orElse(null);
        if (admin != null) {
            if (!admin.getBranch().getId().equals(workerBranch.getId())) {
                throw new AccessDeniedException("Unauthorized: Cannot reset password for worker in another branch");
            }
        } else {
            List<Organization> orgs = organizationRepository.findByOwnerId(currentUserId);
            if (orgs.isEmpty() || !workerBranch.getOrganization().getId().equals(orgs.get(0).getId())) {
                throw new AccessDeniedException("Unauthorized: Cannot reset password for this worker");
            }
        }

        String newTempPassword = passwordGenerator.generateTemporaryPassword();
        User workerUser = worker.getUser();
        workerUser.setPassword(passwordEncoder.encode(newTempPassword));
        workerUser.setMustChangePassword(true);
        userRepository.save(workerUser);

        return new WorkerCreationResponse(
                true,
                "Temporary password generated successfully",
                WorkerCreationResponse.WorkerSummary.fromWorker(worker),
                newTempPassword
        );
    }
    
    @Transactional
    public Worker createWorker(Worker worker, String email, String password, String name) {
        Long currentUserId = getCurrentUserId();
        Branch targetBranch = resolveTargetBranch(currentUserId, worker.getBranch() != null ? worker.getBranch().getId() : null);

        if (targetBranch == null) {
            throw new AccessDeniedException("Unauthorized: Cannot assign worker to specified branch");
        }

        String finalPassword = (password != null && !password.trim().isEmpty())
                ? password.trim()
                : passwordGenerator.generateTemporaryPassword();

        String empId = (worker.getEmployeeId() != null && !worker.getEmployeeId().trim().isEmpty())
                ? worker.getEmployeeId().trim()
                : generateUniqueEmployeeId(targetBranch);

        String workerUsername = generateWorkerUsername(
                name != null ? name : empId,
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
        worker.setEmployeeId(empId);
        
        return workerRepository.save(worker);
    }
    
    @Transactional
    public Worker updateWorker(Long id, Worker workerDetails) {
        Worker worker = workerRepository.findById(id).orElse(null);
        if (worker == null) return null;
        
        if (workerDetails.getEmployeeId() != null) {
            worker.setEmployeeId(workerDetails.getEmployeeId());
        }
        if (workerDetails.getDesignation() != null) {
            worker.setDesignation(workerDetails.getDesignation());
        }
        if (workerDetails.getSalary() != null) {
            worker.setSalary(workerDetails.getSalary());
        }
        if (workerDetails.getHireDate() != null) {
            worker.setHireDate(workerDetails.getHireDate());
        }
        if (workerDetails.getStatus() != null) {
            worker.setStatus(workerDetails.getStatus());
        }
        
        return workerRepository.save(worker);
    }
    
    @Transactional
    public void deleteWorker(Long id) {
        workerRepository.deleteById(id);
    }

    private Branch resolveTargetBranch(Long currentUserId, Long requestedBranchId) {
        // If caller is Admin -> branch is ALWAYS Admin's branch
        Admin admin = adminRepository.findByUserId(currentUserId).orElse(null);
        if (admin != null) {
            return admin.getBranch();
        }

        // If caller is Owner -> branch must belong to Owner's organization
        List<Organization> orgs = organizationRepository.findByOwnerId(currentUserId);
        if (!orgs.isEmpty() && requestedBranchId != null) {
            Branch b = branchRepository.findById(requestedBranchId).orElse(null);
            if (b != null && b.getOrganization().getId().equals(orgs.get(0).getId())) {
                return b;
            }
        }

        return null;
    }

    private String generateUniqueEmployeeId(Branch branch) {
        String codePrefix = (branch.getBranchCode() != null && !branch.getBranchCode().isEmpty())
                ? branch.getBranchCode()
                : ("BR" + branch.getId());

        List<Worker> branchWorkers = workerRepository.findByBranchId(branch.getId());
        int nextSeq = branchWorkers.size() + 1;
        String candidate = String.format("%s-W%03d", codePrefix, nextSeq);

        while (workerRepository.findByEmployeeId(candidate).isPresent()) {
            nextSeq++;
            candidate = String.format("%s-W%03d", codePrefix, nextSeq);
        }
        return candidate;
    }

    private String generateWorkerUsername(String name, String branchCode) {
        String base = (name != null ? name.toLowerCase().replaceAll("[^a-z0-9]", "") : "worker");
        if (base.isEmpty()) base = "worker";

        String suffix = (branchCode != null ? branchCode.toLowerCase().replace("-", "") : "");
        String username = base + "." + suffix;
        if (username.length() > 50) username = username.substring(0, 50);

        int counter = 1;
        String candidate = username;
        while (userRepository.existsByUsername(candidate)) {
            candidate = username + counter++;
        }
        return candidate;
    }
}

package com.sems.service;

import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, UserRepository userRepository,
                        BranchRepository branchRepository, OrganizationRepository organizationRepository,
                        PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getId();
        }
        return null;
    }

    public List<Admin> getAdminsForOwner() {
        Long ownerId = getCurrentUserId();
        List<Organization> orgs = organizationRepository.findByOwnerId(ownerId);
        if (orgs.isEmpty()) return List.of();
        Organization org = orgs.get(0);
        List<Branch> branches = branchRepository.findByOrganizationId(org.getId());
        return branches.stream()
            .flatMap(b -> adminRepository.findByBranchId(b.getId()).stream())
            .toList();
    }

    public List<Admin> getAdminsByBranch(Long branchId) {
        return adminRepository.findByBranchId(branchId);
    }

    @Transactional
    public Admin createAdmin(String name, String email, String password, String phone,
                             Long branchId, String designation) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }
        Branch branch = branchRepository.findById(branchId)
            .orElseThrow(() -> new RuntimeException("Branch not found"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setRole(User.Role.ADMIN);
        User savedUser = userRepository.save(user);

        Admin admin = new Admin();
        admin.setUser(savedUser);
        admin.setBranch(branch);
        admin.setDesignation(designation);
        return adminRepository.save(admin);
    }

    @Transactional
    public Admin updateAdmin(Long id, String designation, Long branchId) {
        Admin admin = adminRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (designation != null) admin.setDesignation(designation);
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
            admin.setBranch(branch);
        }
        return adminRepository.save(admin);
    }

    @Transactional
    public void deleteAdmin(Long id) {
        adminRepository.deleteById(id);
    }
}

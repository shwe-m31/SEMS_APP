package com.sems.service;

import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.UserPrincipal;
import com.sems.util.PasswordGenerator;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;

    public AdminService(AdminRepository adminRepository, UserRepository userRepository,
                        BranchRepository branchRepository, OrganizationRepository organizationRepository,
                        PasswordEncoder passwordEncoder, PasswordGenerator passwordGenerator) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
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
    public Map<String, Object> createAdmin(String name, String email, String phone,
                                          Long branchId, String designation) {
        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new RuntimeException("Email already in use: " + cleanEmail);
        }

        // Validate branch belongs to owner's organization
        Long ownerId = getCurrentUserId();
        List<Organization> ownerOrgs = organizationRepository.findByOwnerId(ownerId);
        if (ownerOrgs.isEmpty()) {
            throw new AccessDeniedException("No organization found for current owner");
        }
        Long ownerOrgId = ownerOrgs.get(0).getId();

        Branch branch = branchRepository.findById(branchId)
            .orElseThrow(() -> new RuntimeException("Branch not found"));

        if (!branch.getOrganization().getId().equals(ownerOrgId)) {
            throw new AccessDeniedException("Unauthorized: Branch does not belong to owner's organization");
        }

        String tempPassword = passwordGenerator.generateTemporaryPassword();
        String branchCode = branch.getBranchCode() != null ? branch.getBranchCode() : "BRN";
        String adminUsername = generateAdminUsername(name, branchCode);

        User user = new User();
        user.setUsername(adminUsername);
        user.setName(name.trim());
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setPhone(phone);
        user.setRole(User.Role.ADMIN);
        user.setMustChangePassword(true);
        User savedUser = userRepository.save(user);

        Admin admin = new Admin();
        admin.setUser(savedUser);
        admin.setBranch(branch);
        admin.setDesignation(designation != null && !designation.trim().isEmpty() ? designation.trim() : "Branch Admin");
        Admin savedAdmin = adminRepository.save(admin);

        Map<String, Object> result = new HashMap<>();
        result.put("admin", savedAdmin);
        result.put("branchCode", branch.getBranchCode());
        result.put("temporaryPassword", tempPassword);
        return result;
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

    private String generateAdminUsername(String name, String branchCode) {
        String base = (name != null ? name.toLowerCase().replaceAll("[^a-z0-9]", "") : "admin");
        if (base.isEmpty()) base = "admin";
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

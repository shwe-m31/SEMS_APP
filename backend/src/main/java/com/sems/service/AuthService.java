package com.sems.service;

import com.sems.dto.*;
import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.JwtTokenProvider;
import com.sems.security.UserPrincipal;
import com.sems.util.BranchCodeGenerator;
import com.sems.util.PasswordGenerator;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final WorkerRepository workerRepository;
    private final AdminRepository adminRepository;
    private final BranchCodeGenerator branchCodeGenerator;
    private final PasswordGenerator passwordGenerator;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                       OrganizationRepository organizationRepository, BranchRepository branchRepository,
                       WorkerRepository workerRepository, AdminRepository adminRepository,
                       BranchCodeGenerator branchCodeGenerator, PasswordGenerator passwordGenerator) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.organizationRepository = organizationRepository;
        this.branchRepository = branchRepository;
        this.workerRepository = workerRepository;
        this.adminRepository = adminRepository;
        this.branchCodeGenerator = branchCodeGenerator;
        this.passwordGenerator = passwordGenerator;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String role = loginRequest.getRole() != null ? loginRequest.getRole().trim().toUpperCase() : null;
        String branchCode = loginRequest.getBranchCode() != null ? loginRequest.getBranchCode().trim() : null;
        String employeeId = loginRequest.getEmployeeId() != null ? loginRequest.getEmployeeId().trim() : null;

        // 1. ADMIN LOGIN FLOW (by Branch Code + Password)
        if ("ADMIN".equals(role) || (branchCode != null && !branchCode.isEmpty() && (employeeId == null || employeeId.isEmpty()) && (role == null || "ADMIN".equals(role)))) {
            Branch branch = branchRepository.findByBranchCode(branchCode)
                    .orElseThrow(() -> new BadCredentialsException("Invalid Branch Code: " + branchCode));

            Admin admin = adminRepository.findFirstByBranchBranchCode(branch.getBranchCode())
                    .orElseThrow(() -> new BadCredentialsException("No Admin assigned to branch code: " + branchCode));

            User adminUser = admin.getUser();
            if (!passwordEncoder.matches(loginRequest.getPassword(), adminUser.getPassword())) {
                throw new BadCredentialsException("Invalid password for branch admin");
            }

            UserPrincipal userPrincipal = UserPrincipal.create(adminUser);
            Authentication auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
            String token = tokenProvider.generateToken(auth);

            return new JwtResponse(
                    token,
                    "Bearer",
                    adminUser.getId(),
                    adminUser.getUsername(),
                    adminUser.getEmail(),
                    adminUser.getName(),
                    "ADMIN",
                    branch.getId(),
                    branch.getBranchCode(),
                    branch.getName(),
                    admin.getId(),
                    null,
                    null,
                    branch.getOrganization() != null ? branch.getOrganization().getId() : null,
                    branch.getOrganization() != null ? branch.getOrganization().getName() : null,
                    Boolean.TRUE.equals(adminUser.getMustChangePassword())
            );
        }

        // 2. WORKER LOGIN FLOW (by Branch Code + Employee ID / Username + Password)
        if ("WORKER".equals(role) || (branchCode != null && !branchCode.isEmpty() && (employeeId != null && !employeeId.isEmpty()))) {
            Branch branch = branchRepository.findByBranchCode(branchCode)
                    .orElseThrow(() -> new BadCredentialsException("Invalid Branch Code: " + branchCode));

            Worker worker = null;
            if (employeeId != null && !employeeId.isEmpty()) {
                worker = workerRepository.findByBranchIdAndEmployeeId(branch.getId(), employeeId).orElse(null);
            }
            if (worker == null && loginRequest.getUsername() != null && !loginRequest.getUsername().trim().isEmpty()) {
                worker = workerRepository.findByBranchBranchCodeAndUserUsername(branchCode, loginRequest.getUsername().trim()).orElse(null);
            }
            if (worker == null) {
                throw new BadCredentialsException("Worker not found for branch: " + branchCode + " with identifier: " + employeeId);
            }

            User workerUser = worker.getUser();
            if (!passwordEncoder.matches(loginRequest.getPassword(), workerUser.getPassword())) {
                throw new BadCredentialsException("Invalid password for worker");
            }

            UserPrincipal userPrincipal = UserPrincipal.create(workerUser);
            Authentication auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
            String token = tokenProvider.generateToken(auth);

            return new JwtResponse(
                    token,
                    "Bearer",
                    workerUser.getId(),
                    workerUser.getUsername(),
                    workerUser.getEmail(),
                    workerUser.getName(),
                    "WORKER",
                    branch.getId(),
                    branch.getBranchCode(),
                    branch.getName(),
                    null,
                    worker.getId(),
                    worker.getEmployeeId(),
                    branch.getOrganization() != null ? branch.getOrganization().getId() : null,
                    branch.getOrganization() != null ? branch.getOrganization().getName() : null,
                    Boolean.TRUE.equals(workerUser.getMustChangePassword())
            );
        }

        // 3. OWNER OR FALLBACK (by Username or Email + Password)
        String identifier = loginRequest.getUsername() != null && !loginRequest.getUsername().trim().isEmpty()
                ? loginRequest.getUsername().trim()
                : loginRequest.getEmail();

        if (identifier == null || identifier.trim().isEmpty()) {
            throw new BadCredentialsException("Username, email, or branch code is required");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        identifier.trim(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        String userRole = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        Long branchId = null;
        String userBranchCode = null;
        String branchName = null;
        Long adminId = null;
        Long workerId = null;
        String workerEmployeeId = null;
        Long organizationId = null;
        String organizationName = null;

        if ("ADMIN".equals(userRole)) {
            Admin admin = adminRepository.findByUserId(userPrincipal.getId()).orElse(null);
            if (admin != null && admin.getBranch() != null) {
                adminId = admin.getId();
                branchId = admin.getBranch().getId();
                userBranchCode = admin.getBranch().getBranchCode();
                branchName = admin.getBranch().getName();
                if (admin.getBranch().getOrganization() != null) {
                    organizationId = admin.getBranch().getOrganization().getId();
                    organizationName = admin.getBranch().getOrganization().getName();
                }
            }
        } else if ("WORKER".equals(userRole)) {
            Worker worker = workerRepository.findByUserId(userPrincipal.getId()).orElse(null);
            if (worker != null && worker.getBranch() != null) {
                workerId = worker.getId();
                workerEmployeeId = worker.getEmployeeId();
                branchId = worker.getBranch().getId();
                userBranchCode = worker.getBranch().getBranchCode();
                branchName = worker.getBranch().getName();
                if (worker.getBranch().getOrganization() != null) {
                    organizationId = worker.getBranch().getOrganization().getId();
                    organizationName = worker.getBranch().getOrganization().getName();
                }
            }
        } else if ("OWNER".equals(userRole)) {
            var orgs = organizationRepository.findByOwnerId(userPrincipal.getId());
            if (!orgs.isEmpty()) {
                Organization org = orgs.get(0);
                organizationId = org.getId();
                organizationName = org.getName();
            }
        }

        return new JwtResponse(
                token,
                "Bearer",
                userPrincipal.getId(),
                user != null ? user.getUsername() : userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getName(),
                userRole,
                branchId,
                userBranchCode,
                branchName,
                adminId,
                workerId,
                workerEmployeeId,
                organizationId,
                organizationName,
                user != null && Boolean.TRUE.equals(user.getMustChangePassword())
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public OwnerRegistrationResponse registerOwner(OwnerRegistrationRequest request) {
        // 1. Validations
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }
        String cleanUsername = request.getUsername().trim();
        if (userRepository.existsByUsername(cleanUsername)) {
            throw new IllegalArgumentException("Username '" + cleanUsername + "' is already taken");
        }

        if (request.getOwner() == null || request.getOwner().getEmail() == null) {
            throw new IllegalArgumentException("Owner email is required");
        }
        String cleanOwnerEmail = request.getOwner().getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanOwnerEmail)) {
            throw new IllegalArgumentException("Email '" + cleanOwnerEmail + "' is already registered");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and Confirm Password do not match");
        }

        if (request.getBranches() == null || request.getBranches().isEmpty()) {
            throw new IllegalArgumentException("At least one branch is required");
        }

        // Check for duplicate admin emails within request and against database
        if (request.getAdmins() != null) {
            Set<String> seenAdminEmails = new HashSet<>();
            for (OwnerRegistrationRequest.AdminDetails adminDto : request.getAdmins()) {
                if (adminDto != null && adminDto.getEmail() != null) {
                    String adminEmail = adminDto.getEmail().trim().toLowerCase();
                    if (adminEmail.equalsIgnoreCase(cleanOwnerEmail)) {
                        throw new IllegalArgumentException("Admin email cannot be the same as Owner email: " + adminEmail);
                    }
                    if (!seenAdminEmails.add(adminEmail)) {
                        throw new IllegalArgumentException("Duplicate admin email in registration: " + adminEmail);
                    }
                    if (userRepository.existsByEmail(adminEmail)) {
                        throw new IllegalArgumentException("Admin email is already registered: " + adminEmail);
                    }
                }
            }
        }

        // 2. Create Owner User
        User ownerUser = new User();
        ownerUser.setUsername(cleanUsername);
        ownerUser.setName(request.getOwner().getName().trim());
        ownerUser.setEmail(cleanOwnerEmail);
        ownerUser.setPassword(passwordEncoder.encode(request.getPassword()));
        ownerUser.setPhone(request.getOwner().getPhone());
        if (request.getOwner().getDateOfBirth() != null && !request.getOwner().getDateOfBirth().trim().isEmpty()) {
            ownerUser.setDateOfBirth(LocalDate.parse(request.getOwner().getDateOfBirth().trim()));
        }
        ownerUser.setGender(request.getOwner().getGender());
        ownerUser.setRole(User.Role.OWNER);
        ownerUser.setMustChangePassword(false);
        User savedOwner = userRepository.save(ownerUser);

        // 3. Create Organization
        Organization org = new Organization();
        org.setOwner(savedOwner);
        org.setName(request.getOrganization().getName().trim());
        
        String sizeStr = request.getOrganization().getSize() != null ? request.getOrganization().getSize().toUpperCase() : "MEDIUM";
        try {
            org.setType(Organization.OrganizationType.valueOf(sizeStr));
        } catch (Exception e) {
            org.setType(Organization.OrganizationType.MEDIUM);
        }

        org.setCategory(request.getOrganization().getCategory());
        org.setSubCategory(request.getOrganization().getType());
        org.setIndustryType(mapCategoryToIndustryType(request.getOrganization().getCategory()));
        org.setHasBranches(request.getOrganization().getHasBranches() != null && request.getOrganization().getHasBranches());
        Organization savedOrg = organizationRepository.save(org);

        // 4. Create Branches & Admins
        List<OwnerRegistrationResponse.BranchSummary> branchSummaries = new ArrayList<>();

        for (int i = 0; i < request.getBranches().size(); i++) {
            OwnerRegistrationRequest.BranchDetails branchDto = request.getBranches().get(i);
            Branch branch = new Branch();
            branch.setOrganization(savedOrg);
            branch.setName(branchDto.getName().trim());
            branch.setState(branchDto.getState().trim());
            branch.setCity(branchDto.getCity().trim());
            branch.setPincode(branchDto.getPincode().trim());
            branch.setLocation(branchDto.getCity().trim() + ", " + branchDto.getState().trim());
            branch.setCategory(branchDto.getCategory() != null ? branchDto.getCategory() : org.getCategory());
            branch.setOrganizationType(branchDto.getType() != null ? branchDto.getType() : org.getSubCategory());
            branch.setAddress(branchDto.getAddress());
            branch.setPhone(branchDto.getPhone());

            // Unique Branch Code generation
            String branchCode = branchCodeGenerator.generateBranchCode(branchDto.getCity(), branchDto.getName());
            branch.setBranchCode(branchCode);
            Branch savedBranch = branchRepository.save(branch);

            // Find assigned Admin for this branch
            OwnerRegistrationRequest.AdminDetails adminDto = findAdminForBranch(request.getAdmins(), i, branchDto.getName());
            OwnerRegistrationResponse.AdminSummary adminSummary = null;

            if (adminDto != null) {
                String tempPassword = passwordGenerator.generateTemporaryPassword();
                String adminEmail = adminDto.getEmail().trim().toLowerCase();
                String adminUsername = generateAdminUsername(adminDto.getName(), branchCode);

                User adminUser = new User();
                adminUser.setUsername(adminUsername);
                adminUser.setName(adminDto.getName().trim());
                adminUser.setEmail(adminEmail);
                adminUser.setPassword(passwordEncoder.encode(tempPassword));
                adminUser.setPhone(adminDto.getPhone());
                if (adminDto.getDateOfBirth() != null && !adminDto.getDateOfBirth().trim().isEmpty()) {
                    adminUser.setDateOfBirth(LocalDate.parse(adminDto.getDateOfBirth().trim()));
                }
                adminUser.setGender(adminDto.getGender());
                adminUser.setRole(User.Role.ADMIN);
                adminUser.setMustChangePassword(true);
                User savedAdminUser = userRepository.save(adminUser);

                Admin admin = new Admin();
                admin.setUser(savedAdminUser);
                admin.setBranch(savedBranch);
                admin.setDesignation("Branch Admin");
                admin.setTemporaryPassword(tempPassword);
                Admin savedAdmin = adminRepository.save(admin);

                adminSummary = new OwnerRegistrationResponse.AdminSummary(
                        savedAdmin.getId(),
                        adminUsername,
                        savedAdminUser.getName(),
                        savedAdminUser.getEmail(),
                        tempPassword
                );
            }

            branchSummaries.add(new OwnerRegistrationResponse.BranchSummary(
                    savedBranch.getId(),
                    savedBranch.getName(),
                    savedBranch.getBranchCode(),
                    savedBranch.getState(),
                    savedBranch.getCity(),
                    savedBranch.getPincode(),
                    savedBranch.getCategory(),
                    savedBranch.getOrganizationType(),
                    adminSummary
            ));
        }

        // 5. Generate token for owner
        UserPrincipal userPrincipal = UserPrincipal.create(savedOwner);
        Authentication auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        String token = tokenProvider.generateToken(auth);

        return new OwnerRegistrationResponse(
                true,
                "Organization and branches created successfully",
                token,
                new OwnerRegistrationResponse.OwnerSummary(
                        savedOwner.getId(),
                        savedOwner.getUsername(),
                        savedOwner.getName(),
                        savedOwner.getEmail(),
                        "OWNER"
                ),
                new OwnerRegistrationResponse.OrganizationSummary(
                        savedOrg.getId(),
                        savedOrg.getName(),
                        savedOrg.getType().name(),
                        savedOrg.getCategory(),
                        savedOrg.getSubCategory()
                ),
                branchSummaries
        );
    }

    @Transactional
    public ApiResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new ApiResponse(false, "Email is already registered");
        }

        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setUsername(registerRequest.getEmail().split("@")[0]);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        if (registerRequest.getDateOfBirth() != null && !registerRequest.getDateOfBirth().isEmpty()) {
            user.setDateOfBirth(LocalDate.parse(registerRequest.getDateOfBirth()));
        }
        user.setGender(registerRequest.getGender());
        user.setRole(User.Role.valueOf(registerRequest.getRole().toUpperCase()));
        user.setMustChangePassword(false);

        User savedUser = userRepository.save(user);

        if (user.getRole() == User.Role.OWNER) {
            Organization organization = new Organization();
            organization.setOwner(savedUser);
            organization.setName(registerRequest.getOrganizationName());
            if (registerRequest.getOrganizationType() != null) {
                organization.setType(Organization.OrganizationType.valueOf(registerRequest.getOrganizationType().toUpperCase()));
            } else {
                organization.setType(Organization.OrganizationType.SMALL);
            }
            if (registerRequest.getIndustryType() != null) {
                organization.setIndustryType(Organization.IndustryType.valueOf(registerRequest.getIndustryType().toUpperCase()));
            } else {
                organization.setIndustryType(Organization.IndustryType.OTHER_MSME);
            }
            organization.setHasBranches(registerRequest.getHasBranches() != null ? registerRequest.getHasBranches() : false);
            organizationRepository.save(organization);
        }

        return new ApiResponse(true, "User registered successfully", savedUser.getId());
    }

    @Transactional
    public ApiResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return new ApiResponse(true, "Password changed successfully");
    }

    public Map<String, Object> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user == null) return null;

            Map<String, Object> result = new HashMap<>();
            result.put("id", user.getId());
            result.put("username", user.getUsername());
            result.put("email", user.getEmail());
            result.put("name", user.getName());
            result.put("phone", user.getPhone());
            result.put("role", user.getRole().name());
            result.put("mustChangePassword", Boolean.TRUE.equals(user.getMustChangePassword()));

            String role = user.getRole().name();
            if ("ADMIN".equals(role)) {
                Admin admin = adminRepository.findByUserId(user.getId()).orElse(null);
                if (admin != null && admin.getBranch() != null) {
                    result.put("adminId", admin.getId());
                    result.put("branchId", admin.getBranch().getId());
                    result.put("branchCode", admin.getBranch().getBranchCode());
                    result.put("branchName", admin.getBranch().getName());
                    if (admin.getBranch().getOrganization() != null) {
                        result.put("organizationId", admin.getBranch().getOrganization().getId());
                        result.put("organizationName", admin.getBranch().getOrganization().getName());
                    }
                }
            } else if ("WORKER".equals(role)) {
                Worker worker = workerRepository.findByUserId(user.getId()).orElse(null);
                if (worker != null && worker.getBranch() != null) {
                    result.put("workerId", worker.getId());
                    result.put("employeeId", worker.getEmployeeId());
                    result.put("branchId", worker.getBranch().getId());
                    result.put("branchCode", worker.getBranch().getBranchCode());
                    result.put("branchName", worker.getBranch().getName());
                    result.put("designation", worker.getDesignation());
                    if (worker.getBranch().getOrganization() != null) {
                        result.put("organizationId", worker.getBranch().getOrganization().getId());
                        result.put("organizationName", worker.getBranch().getOrganization().getName());
                    }
                }
            } else if ("OWNER".equals(role)) {
                var orgs = organizationRepository.findByOwnerId(user.getId());
                if (!orgs.isEmpty()) {
                    result.put("organizationId", orgs.get(0).getId());
                    result.put("organizationName", orgs.get(0).getName());
                }
            }

            return result;
        }
        return null;
    }

    private OwnerRegistrationRequest.AdminDetails findAdminForBranch(
            List<OwnerRegistrationRequest.AdminDetails> admins, int branchIndex, String branchName) {
        if (admins == null) return null;

        // Try match by branchIndex
        for (OwnerRegistrationRequest.AdminDetails admin : admins) {
            if (admin.getBranchIndex() != null && admin.getBranchIndex() == branchIndex) {
                return admin;
            }
        }

        // Try match by branchName
        if (branchName != null) {
            for (OwnerRegistrationRequest.AdminDetails admin : admins) {
                if (branchName.equalsIgnoreCase(admin.getBranchName())) {
                    return admin;
                }
            }
        }

        // Fallback: index within admins list if size matches
        if (branchIndex < admins.size()) {
            return admins.get(branchIndex);
        }

        return null;
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

    private Organization.IndustryType mapCategoryToIndustryType(String category) {
        if (category == null) return Organization.IndustryType.OTHER_MSME;
        switch (category.toUpperCase()) {
            case "RESTAURANTS":
            case "SHOPS":
            case "STORES":
                return Organization.IndustryType.FOOD_RETAIL;
            case "MANUFACTURING":
                return Organization.IndustryType.MANUFACTURING;
            case "WAREHOUSE":
            case "DISTRIBUTION":
                return Organization.IndustryType.WAREHOUSE_DISTRIBUTION;
            default:
                return Organization.IndustryType.OTHER_MSME;
        }
    }
}

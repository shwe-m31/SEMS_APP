package com.sems.service;

import com.sems.dto.*;
import com.sems.entity.*;
import com.sems.repository.*;
import com.sems.security.JwtTokenProvider;
import com.sems.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

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

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                       OrganizationRepository organizationRepository, BranchRepository branchRepository,
                       WorkerRepository workerRepository, AdminRepository adminRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.organizationRepository = organizationRepository;
        this.branchRepository = branchRepository;
        this.workerRepository = workerRepository;
        this.adminRepository = adminRepository;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String role = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        Long branchId = null;
        Long adminId = null;
        Long workerId = null;
        Long organizationId = null;

        if ("ADMIN".equals(role)) {
            Admin admin = adminRepository.findByUserId(userPrincipal.getId()).orElse(null);
            if (admin != null) {
                adminId = admin.getId();
                branchId = admin.getBranch().getId();
            }
        } else if ("WORKER".equals(role)) {
            Worker worker = workerRepository.findByUserId(userPrincipal.getId()).orElse(null);
            if (worker != null) {
                workerId = worker.getId();
                branchId = worker.getBranch().getId();
            }
        } else if ("OWNER".equals(role)) {
            organizationRepository.findByOwnerId(userPrincipal.getId())
                .stream().findFirst().ifPresent(org -> {});
            var orgs = organizationRepository.findByOwnerId(userPrincipal.getId());
            if (!orgs.isEmpty()) {
                organizationId = orgs.get(0).getId();
            }
        }

        return new JwtResponse(
            token,
            "Bearer",
            userPrincipal.getId(),
            userPrincipal.getEmail(),
            userPrincipal.getName(),
            role,
            branchId,
            adminId,
            workerId,
            organizationId
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
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        if (registerRequest.getDateOfBirth() != null && !registerRequest.getDateOfBirth().isEmpty()) {
            user.setDateOfBirth(LocalDate.parse(registerRequest.getDateOfBirth()));
        }
        user.setGender(registerRequest.getGender());
        user.setRole(User.Role.valueOf(registerRequest.getRole().toUpperCase()));

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

    public Map<String, Object> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user == null) return null;

            Map<String, Object> result = new HashMap<>();
            result.put("id", user.getId());
            result.put("email", user.getEmail());
            result.put("name", user.getName());
            result.put("phone", user.getPhone());
            result.put("role", user.getRole().name());

            String role = user.getRole().name();
            if ("ADMIN".equals(role)) {
                Admin admin = adminRepository.findByUserId(user.getId()).orElse(null);
                if (admin != null) {
                    result.put("adminId", admin.getId());
                    result.put("branchId", admin.getBranch().getId());
                    result.put("branchName", admin.getBranch().getName());
                }
            } else if ("WORKER".equals(role)) {
                Worker worker = workerRepository.findByUserId(user.getId()).orElse(null);
                if (worker != null) {
                    result.put("workerId", worker.getId());
                    result.put("branchId", worker.getBranch().getId());
                    result.put("branchName", worker.getBranch().getName());
                    result.put("employeeId", worker.getEmployeeId());
                    result.put("designation", worker.getDesignation());
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
}

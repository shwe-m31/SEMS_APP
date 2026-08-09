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
        
        return new JwtResponse(
            token,
            "Bearer",
            userPrincipal.getId(),
            userPrincipal.getEmail(),
            userPrincipal.getName(),
            userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
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
        if (registerRequest.getDateOfBirth() != null) {
            user.setDateOfBirth(LocalDate.parse(registerRequest.getDateOfBirth()));
        }
        user.setGender(registerRequest.getGender());
        user.setRole(User.Role.valueOf(registerRequest.getRole().toUpperCase()));
        
        User savedUser = userRepository.save(user);
        
        if (user.getRole() == User.Role.OWNER) {
            Organization organization = new Organization();
            organization.setOwner(savedUser);
            organization.setName(registerRequest.getOrganizationName());
            organization.setType(Organization.OrganizationType.valueOf(registerRequest.getOrganizationType().toUpperCase()));
            organization.setIndustryType(Organization.IndustryType.valueOf(registerRequest.getIndustryType().toUpperCase()));
            organization.setHasBranches(registerRequest.getHasBranches() != null ? registerRequest.getHasBranches() : false);
            organizationRepository.save(organization);
        }
        
        return new ApiResponse(true, "User registered successfully", savedUser.getId());
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return userRepository.findById(userPrincipal.getId()).orElse(null);
        }
        return null;
    }
}

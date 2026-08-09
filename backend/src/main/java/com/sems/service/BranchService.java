package com.sems.service;

import com.sems.entity.Branch;
import com.sems.entity.Organization;
import com.sems.repository.BranchRepository;
import com.sems.repository.OrganizationRepository;
import com.sems.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BranchService {
    
    private final BranchRepository branchRepository;
    private final OrganizationRepository organizationRepository;
    
    public BranchService(BranchRepository branchRepository, OrganizationRepository organizationRepository) {
        this.branchRepository = branchRepository;
        this.organizationRepository = organizationRepository;
    }
    
    public List<Branch> getAllBranches() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        List<Organization> organizations = organizationRepository.findByOwnerId(userPrincipal.getId());
        if (!organizations.isEmpty()) {
            return branchRepository.findByOrganizationId(organizations.get(0).getId());
        }
        return List.of();
    }
    
    public Branch getBranchById(Long id) {
        return branchRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Branch createBranch(Branch branch) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        List<Organization> organizations = organizationRepository.findByOwnerId(userPrincipal.getId());
        if (!organizations.isEmpty()) {
            branch.setOrganization(organizations.get(0));
            return branchRepository.save(branch);
        }
        return null;
    }
    
    @Transactional
    public Branch updateBranch(Long id, Branch branchDetails) {
        Branch branch = branchRepository.findById(id).orElse(null);
        if (branch == null) return null;
        
        branch.setName(branchDetails.getName());
        branch.setLocation(branchDetails.getLocation());
        branch.setAddress(branchDetails.getAddress());
        branch.setPhone(branchDetails.getPhone());
        
        return branchRepository.save(branch);
    }
    
    @Transactional
    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }
}

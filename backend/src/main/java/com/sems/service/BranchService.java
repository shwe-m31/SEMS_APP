package com.sems.service;

import com.sems.entity.Branch;
import com.sems.entity.Organization;
import com.sems.repository.BranchRepository;
import com.sems.repository.OrganizationRepository;
import com.sems.security.UserPrincipal;
import com.sems.util.BranchCodeGenerator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BranchService {
    
    private final BranchRepository branchRepository;
    private final OrganizationRepository organizationRepository;
    private final BranchCodeGenerator branchCodeGenerator;
    
    public BranchService(BranchRepository branchRepository, OrganizationRepository organizationRepository,
                         BranchCodeGenerator branchCodeGenerator) {
        this.branchRepository = branchRepository;
        this.organizationRepository = organizationRepository;
        this.branchCodeGenerator = branchCodeGenerator;
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
            Organization org = organizations.get(0);
            branch.setOrganization(org);
            
            if (branch.getBranchCode() == null || branch.getBranchCode().trim().isEmpty()) {
                branch.setBranchCode(branchCodeGenerator.generateBranchCode(branch.getCity(), branch.getName()));
            }

            if (branch.getLocation() == null || branch.getLocation().trim().isEmpty()) {
                if (branch.getCity() != null && branch.getState() != null) {
                    branch.setLocation(branch.getCity() + ", " + branch.getState());
                } else if (branch.getCity() != null) {
                    branch.setLocation(branch.getCity());
                }
            }

            return branchRepository.save(branch);
        }
        return null;
    }
    
    @Transactional
    public Branch updateBranch(Long id, Branch branchDetails) {
        Branch branch = branchRepository.findById(id).orElse(null);
        if (branch == null) return null;
        
        branch.setName(branchDetails.getName());
        if (branchDetails.getState() != null) branch.setState(branchDetails.getState());
        if (branchDetails.getCity() != null) branch.setCity(branchDetails.getCity());
        if (branchDetails.getPincode() != null) branch.setPincode(branchDetails.getPincode());
        if (branchDetails.getCategory() != null) branch.setCategory(branchDetails.getCategory());
        if (branchDetails.getOrganizationType() != null) branch.setOrganizationType(branchDetails.getOrganizationType());
        branch.setLocation(branchDetails.getLocation() != null ? branchDetails.getLocation() : 
                (branch.getCity() != null ? branch.getCity() + (branch.getState() != null ? ", " + branch.getState() : "") : branch.getLocation()));
        branch.setAddress(branchDetails.getAddress());
        branch.setPhone(branchDetails.getPhone());
        
        return branchRepository.save(branch);
    }
    
    @Transactional
    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }
}

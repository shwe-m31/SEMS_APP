package com.sems.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String password;
    
    private String phone;
    
    private String dateOfBirth;
    
    private String gender;
    
    @NotNull
    private String role; // OWNER or WORKER
    
    // Owner specific fields
    private String organizationName;
    private String organizationType;
    private String industryType;
    private Boolean hasBranches;
    
    // Worker specific fields
    private String branchCode;
}

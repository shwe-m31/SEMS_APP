package com.sems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String username;
    private String branchCode;
    private String employeeId;
    private String role; // OWNER, ADMIN, WORKER
    
    @NotBlank
    private String password;
}

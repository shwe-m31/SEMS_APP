package com.sems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String name;
    private String role;
    private Long branchId;
    private String branchCode;
    private String branchName;
    private Long adminId;
    private Long workerId;
    private String employeeId;
    private Long organizationId;
    private String organizationName;
    private Boolean mustChangePassword = false;

    public JwtResponse(String token, String type, Long id, String email, String name, String role) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public JwtResponse(String token, String type, Long id, String email, String name, String role,
                       Long branchId, Long adminId, Long workerId, Long organizationId) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.branchId = branchId;
        this.adminId = adminId;
        this.workerId = workerId;
        this.organizationId = organizationId;
    }
}

package com.sems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerCreationRequest {
    private String name;
    private String email;
    private String phone;
    private String dateOfBirth;
    private String gender;
    private String designation;
    private BigDecimal salary;
    private String hireDate;
    private Long branchId; // only used by Owner; Admin's branch is strictly determined from JWT
}

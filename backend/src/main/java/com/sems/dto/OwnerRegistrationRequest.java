package com.sems.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRegistrationRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private String confirmPassword;

    @NotNull(message = "Owner details are required")
    @Valid
    private OwnerDetails owner;

    @NotNull(message = "Organization details are required")
    @Valid
    private OrganizationDetails organization;

    @NotEmpty(message = "At least one branch is required")
    @Valid
    private List<BranchDetails> branches;

    @Valid
    private List<AdminDetails> admins;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerDetails {
        @NotBlank(message = "Owner name is required")
        private String name;

        @NotBlank(message = "Owner email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
        private String dateOfBirth;
        private String gender;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationDetails {
        @NotBlank(message = "Organization name is required")
        private String name;

        private String size; // SMALL, MEDIUM, LARGE
        private String category; // RESTAURANTS, SHOPS, etc.
        private String type; // Subcategory
        private Boolean hasBranches = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchDetails {
        @NotBlank(message = "Branch name is required")
        private String name;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "Pincode is required")
        private String pincode;

        private String category;
        private String type;
        private String address;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminDetails {
        @NotBlank(message = "Admin name is required")
        private String name;

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid admin email")
        private String email;

        private String phone;
        private String dateOfBirth;
        private String gender;
        private Integer branchIndex; // Index in branches array
        private String branchName;
    }
}

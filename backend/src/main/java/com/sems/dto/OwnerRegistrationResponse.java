package com.sems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRegistrationResponse {
    private boolean success;
    private String message;
    private String token;
    private OwnerSummary owner;
    private OrganizationSummary organization;
    private List<BranchSummary> branches;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerSummary {
        private Long id;
        private String username;
        private String name;
        private String email;
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationSummary {
        private Long id;
        private String name;
        private String size;
        private String category;
        private String subCategory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchSummary {
        private Long id;
        private String name;
        private String branchCode;
        private String state;
        private String city;
        private String pincode;
        private String category;
        private String organizationType;
        private AdminSummary admin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminSummary {
        private Long id;
        private String username;
        private String name;
        private String email;
        private String temporaryPassword;
    }
}

package com.sems.dto;

import com.sems.entity.Worker;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerCreationResponse {
    private boolean success = true;
    private String message;
    private WorkerSummary worker;
    private String temporaryPassword;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkerSummary {
        private Long id;
        private String employeeId;
        private String name;
        private String username;
        private String email;
        private String designation;
        private String designationLabel;
        private Long branchId;
        private String branchCode;
        private String branchName;

        public static WorkerSummary fromWorker(Worker worker) {
            if (worker == null) return null;
            return new WorkerSummary(
                worker.getId(),
                worker.getEmployeeId(),
                worker.getUser() != null ? worker.getUser().getName() : null,
                worker.getUser() != null ? worker.getUser().getUsername() : null,
                worker.getUser() != null ? worker.getUser().getEmail() : null,
                worker.getDesignation(),
                worker.getDesignationLabel(),
                worker.getBranch() != null ? worker.getBranch().getId() : null,
                worker.getBranch() != null ? worker.getBranch().getBranchCode() : null,
                worker.getBranch() != null ? worker.getBranch().getName() : null
            );
        }
    }
}

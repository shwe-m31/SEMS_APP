package com.sems.controller;

import com.sems.entity.WorkerShift;
import com.sems.service.WorkerShiftService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker-shifts")
public class WorkerShiftController {

    private final WorkerShiftService workerShiftService;

    public WorkerShiftController(WorkerShiftService workerShiftService) {
        this.workerShiftService = workerShiftService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<WorkerShift>> getAllWorkerShifts() {
        return ResponseEntity.ok(workerShiftService.getAllWorkerShifts());
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<WorkerShift>> getWorkerShiftsByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(workerShiftService.getWorkerShiftsByWorker(workerId));
    }

    @GetMapping("/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<WorkerShift>> getWorkerShiftsByShift(@PathVariable Long shiftId) {
        return ResponseEntity.ok(workerShiftService.getWorkerShiftsByShift(shiftId));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'WORKER')")
    public ResponseEntity<List<WorkerShift>> getWorkerShiftsByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(workerShiftService.getWorkerShiftsByDate(date));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<WorkerShift> assignShiftToWorker(@RequestBody Map<String, Object> assignmentData) {
        WorkerShift workerShift = workerShiftService.assignShiftToWorker(
            Long.valueOf(assignmentData.get("workerId").toString()),
            Long.valueOf(assignmentData.get("shiftId").toString()),
            LocalDate.parse(assignmentData.get("date").toString())
        );
        return ResponseEntity.ok(workerShift);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteWorkerShift(@PathVariable Long id) {
        workerShiftService.deleteWorkerShift(id);
        return ResponseEntity.ok().build();
    }
}

package com.sems.service;

import com.sems.entity.Shift;
import com.sems.entity.Worker;
import com.sems.entity.WorkerShift;
import com.sems.repository.ShiftRepository;
import com.sems.repository.WorkerRepository;
import com.sems.repository.WorkerShiftRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class WorkerShiftService {

    private final WorkerShiftRepository workerShiftRepository;
    private final WorkerRepository workerRepository;
    private final ShiftRepository shiftRepository;

    public WorkerShiftService(
            WorkerShiftRepository workerShiftRepository,
            WorkerRepository workerRepository,
            ShiftRepository shiftRepository) {
        this.workerShiftRepository = workerShiftRepository;
        this.workerRepository = workerRepository;
        this.shiftRepository = shiftRepository;
    }

    public List<WorkerShift> getAllWorkerShifts() {
        return workerShiftRepository.findAll();
    }

    public List<WorkerShift> getWorkerShiftsByWorker(Long workerId) {
        return workerShiftRepository.findByWorkerId(workerId);
    }

    public List<WorkerShift> getWorkerShiftsByShift(Long shiftId) {
        return workerShiftRepository.findByShiftId(shiftId);
    }

    public List<WorkerShift> getWorkerShiftsByDate(LocalDate date) {
        return workerShiftRepository.findByDate(date);
    }

    public WorkerShift assignShiftToWorker(Long workerId, Long shiftId, LocalDate date) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));

        WorkerShift workerShift = new WorkerShift();
        workerShift.setWorker(worker);
        workerShift.setShift(shift);
        workerShift.setDate(date);

        return workerShiftRepository.save(workerShift);
    }

    public void removeWorkerShift(Long workerId, Long shiftId, LocalDate date) {
        workerShiftRepository.deleteByWorkerIdAndShiftIdAndDate(workerId, shiftId, date);
    }

    public void deleteWorkerShift(Long id) {
        workerShiftRepository.deleteById(id);
    }
}

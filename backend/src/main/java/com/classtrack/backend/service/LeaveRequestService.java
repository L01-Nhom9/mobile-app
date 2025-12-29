package com.classtrack.backend.service;

import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.repository.ClassroomRepository;
import com.classtrack.backend.repository.EnrollmentRepository;
import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.repository.LeaveRequestRepository;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.utils.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository repo;
    private final ClassroomRepository classroomRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final FileStorageService fileStorageService;

    @Transactional
    public LeaveRequest submitRequest(User student, String classroomId, LocalDate absenceDate, String reason, MultipartFile evidence) {
        Classroom classroom = classroomRepo.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        if (!enrollmentRepo.existsByStudentAndClassroom(student, classroom)) {
            throw new RuntimeException("You are not enrolled in this class");
        }

        if (absenceDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Absence date must be today or in the future");
        }

        // Lưu file
        String filePath = fileStorageService.store(evidence);

        LeaveRequest request = LeaveRequest.builder()
                .student(student)
                .classroom(classroom)
                .absenceDate(absenceDate)
                .reason(reason)
                .evidenceFilePath(filePath)
                .status(LeaveRequest.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return repo.save(request);
    }

    public List<LeaveRequest> getMyRequests(User student) {
        return repo.findByStudent(student);
    }

    // Để INSTRUCTOR xem (mở rộng sau)
    public List<LeaveRequest> getPendingRequestsForClass(String classroomId, User instructor) {
        Classroom classroom = classroomRepo.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        if (!classroom.getInstructor().equals(instructor)) {
            throw new RuntimeException("Not authorized");
        }
        return repo.findByClassroomAndStatus(classroom, LeaveRequest.Status.PENDING);
    }
}
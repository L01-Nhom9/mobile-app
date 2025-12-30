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

    public List<LeaveRequest> getMyRequestsWithFilter(User student, LocalDate startDate, LocalDate endDate) {
        return repo.findByStudentWithFilter(student.getId(), startDate, endDate);
    }

    public List<LeaveRequest> getPendingRequestsForClass(String classroomId, LocalDate startDate, LocalDate endDate, User instructor) {
        Classroom classroom = classroomRepo.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        if (!classroom.getInstructor().equals(instructor)) {
            throw new RuntimeException("Not authorized");
        }
        // Nếu không có filter tuần, dùng method cũ
        if (startDate == null || endDate == null) {
            return repo.findByClassroomAndStatus(classroom, LeaveRequest.Status.PENDING);
        }
        return repo.findPendingByClassAndWeek(classroomId, startDate, endDate);
    }


    @Transactional
    public LeaveRequest approveRequest(Long requestId, User instructor) {
        LeaveRequest request = repo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Kiểm tra quyền: Phải là instructor của lớp
        if (!request.getClassroom().getInstructor().equals(instructor)) {
            throw new RuntimeException("Not authorized to approve this request");
        }

        if (request.getStatus() != LeaveRequest.Status.PENDING) {
            throw new RuntimeException("Request already processed");
        }

        request.setStatus(LeaveRequest.Status.APPROVED);
        request.setApprovedBy(instructor);
        request.setApprovedAt(LocalDateTime.now());
        request.setDenialReason(null); // Xóa nếu có

        return repo.save(request);
    }

    @Transactional
    public LeaveRequest denyRequest(Long requestId, String denialReason, User instructor) {
        LeaveRequest request = repo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getClassroom().getInstructor().equals(instructor)) {
            throw new RuntimeException("Not authorized to deny this request");
        }

        if (request.getStatus() != LeaveRequest.Status.PENDING) {
            throw new RuntimeException("Request already processed");
        }

        if (denialReason == null || denialReason.trim().isEmpty()) {
            throw new RuntimeException("Denial reason is required");
        }

        request.setStatus(LeaveRequest.Status.REJECTED);
        request.setApprovedBy(instructor);
        request.setApprovedAt(LocalDateTime.now());
        request.setDenialReason(denialReason);

        return repo.save(request);
    }
}
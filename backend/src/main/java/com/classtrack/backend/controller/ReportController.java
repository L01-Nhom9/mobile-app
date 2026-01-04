package com.classtrack.backend.controller;

import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.Enrollment;
import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.ClassroomRepository;
import com.classtrack.backend.repository.EnrollmentRepository;
import com.classtrack.backend.repository.LeaveRequestRepository;
import com.classtrack.backend.service.ClassroomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @GetMapping("/{id}/attendance-report")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<byte[]> exportAttendanceReport(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!classroom.getInstructor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not the instructor of this classroom");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByClassroomId(id);
        Map<Long, User> studentMap = new HashMap<>();
        for (Enrollment enrollment : enrollments) {
            studentMap.put(enrollment.getStudent().getId(), enrollment.getStudent());
        }

        List<Object[]> aggregates = leaveRequestRepository.getAttendanceAggregates(id, from, to);

        Map<Long, long[]> reportData = new HashMap<>();
        for (Object[] agg : aggregates) {
            Long studentId = (Long) agg[0];
            Long total = (Long) agg[1];
            Long approved = (Long) agg[2];
            Long rejected = (Long) agg[3];
            Long pending = total - approved - rejected; // Pending = total - approved - rejected
            reportData.put(studentId, new long[]{total, approved, rejected, pending});
        }

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Student Email,Full Name,Total Requests,Approved,Rejected,Pending\n");

        for (Map.Entry<Long, User> entry : studentMap.entrySet()) {
            Long studentId = entry.getKey();
            User student = entry.getValue();
            long[] counts = reportData.getOrDefault(studentId, new long[]{0, 0, 0, 0});

            csvBuilder.append(student.getEmail()).append(",")
                    .append(student.getFullName()).append(",")
                    .append(counts[0]).append(",")
                    .append(counts[1]).append(",")
                    .append(counts[2]).append(",")
                    .append(counts[3]).append("\n");
        }

        byte[] bytes = csvBuilder.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=attendance_report_" + id + ".csv"
                )
                .contentLength(bytes.length)
                .body(bytes);
        }
}
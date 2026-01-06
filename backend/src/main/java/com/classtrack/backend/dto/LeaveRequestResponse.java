package com.classtrack.backend.dto;

import com.classtrack.backend.entity.LeaveRequest;
import java.time.LocalDate;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;


public record LeaveRequestResponse(
        Long id,
        String studentName,
        String classroomId,
        String classroomName,
        LocalDate absenceDate,
        String status,
        String approvedBy,
        String denialReason,
        String evidenceFilePath
) {
    public static LeaveRequestResponse fromEntity(LeaveRequest lr) {
        String evidenceUrl = null;
        if (lr.getEvidenceFilePath() != null) {
            evidenceUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/api/leave-request/evidence/")
                            .path(lr.getId().toString())
                            .toUriString();
        }
        return new LeaveRequestResponse(
                lr.getId(),
                lr.getStudent().getFullName(),
                lr.getClassroom().getId(),
                lr.getClassroom().getName(),
                lr.getAbsenceDate(),
                lr.getStatus().name(),
                lr.getApprovedBy() != null ? lr.getApprovedBy().getFullName() : null,
                lr.getDenialReason(),
                evidenceUrl
        );
    }
}

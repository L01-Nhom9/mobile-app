package com.classtrack.backend.dto;

import com.classtrack.backend.entity.LeaveRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;



public record LeaveRequestInfo(
        Long id,
        String classroomId,
        String classroomName,

        LocalDate absenceDate,
        String reason,
        String evidenceFilePath,

        LeaveRequest.Status status,
        String denialReason,

        String approvedByEmail,
        LocalDateTime approvedAt,
        LocalDateTime createdAt
) {
    public static LeaveRequestInfo fromEntity(LeaveRequest lr) {
        String evidenceUrl = null;
        if (lr.getEvidenceFilePath() != null) {
            evidenceUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/api/leave-request/evidence/")
                            .path(lr.getId().toString())
                            .toUriString();
        }
        return new LeaveRequestInfo(
                lr.getId(),
                lr.getClassroom().getId(),
                lr.getClassroom().getName(),

                lr.getAbsenceDate(),
                lr.getReason(),
                evidenceUrl,

                lr.getStatus(),
                lr.getStatus() == LeaveRequest.Status.REJECTED
                        ? lr.getDenialReason()
                        : null,

                lr.getApprovedBy() != null ? lr.getApprovedBy().getEmail() : null,
                lr.getApprovedAt(),
                lr.getCreatedAt()
        );
    }
}

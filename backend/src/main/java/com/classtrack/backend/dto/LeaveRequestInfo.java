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

        String evidenceFileName,   // Tên file gốc
        String evidenceContentType,

        LeaveRequest.Status status,
        String denialReason,

        String approvedBy,
        LocalDateTime approvedAt,
        LocalDateTime createdAt
) {
    public static LeaveRequestInfo fromEntity(LeaveRequest lr) {
        return new LeaveRequestInfo(
                lr.getId(),
                lr.getClassroom().getId(),
                lr.getClassroom().getName(),

                lr.getAbsenceDate(),
                lr.getReason(),

                lr.getEvidenceFileName(),
                lr.getEvidenceContentType(),

                lr.getStatus(),
                lr.getStatus() == LeaveRequest.Status.REJECTED
                        ? lr.getDenialReason()
                        : null,

                lr.getApprovedBy() != null ? lr.getApprovedBy().getFullName() : null,
                lr.getApprovedAt(),
                lr.getCreatedAt()
        );
    }
}

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
        String evidenceFileName,
        String evidenceContentType
) {
    public static LeaveRequestResponse fromEntity(LeaveRequest lr) {

        return new LeaveRequestResponse(
                lr.getId(),
                lr.getStudent().getFullName(),
                lr.getClassroom().getId(),
                lr.getClassroom().getName(),
                lr.getAbsenceDate(),
                lr.getStatus().name(),
                lr.getApprovedBy() != null ? lr.getApprovedBy().getFullName() : null,
                lr.getDenialReason(),
                lr.getEvidenceFileName(),
                lr.getEvidenceContentType()
        );
    }
}

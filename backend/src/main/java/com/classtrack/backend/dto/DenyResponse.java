package com.classtrack.backend.dto;

import com.classtrack.backend.entity.LeaveRequest;
import java.time.LocalDateTime;


public record DenyResponse(
        Long id,
        String status,
        String denialReason,
        String approvedBy,
        LocalDateTime approvedAt
) {
    public static DenyResponse fromEntity(LeaveRequest lr) {
        return new DenyResponse(
                lr.getId(),
                lr.getStatus().name(),
                lr.getDenialReason(),
                lr.getApprovedBy() != null ? lr.getApprovedBy().getFullName() : null,
                lr.getApprovedAt()
        );
    }
}

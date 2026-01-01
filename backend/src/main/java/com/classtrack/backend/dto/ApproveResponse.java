package com.classtrack.backend.dto;

import com.classtrack.backend.entity.LeaveRequest;
import java.time.LocalDateTime;


public record ApproveResponse(
        Long id,
        String status,
        String approvedBy,
        LocalDateTime approvedAt
) {
    public static ApproveResponse fromEntity(LeaveRequest lr) {
        return new ApproveResponse(
                lr.getId(),
                lr.getStatus().name(),
                lr.getApprovedBy() != null ? lr.getApprovedBy().getFullName() : null,
                lr.getApprovedAt()
        );
    }
}

package com.classtrack.backend.entity;

import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import java.sql.Types;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    private LocalDate absenceDate; //(Format: 2025-12-30)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime approvedAt; // Thời gian phê duyệt

    private String denialReason;


    @Column(nullable = false)
    private String reason;

    @Lob
    @JdbcTypeCode(Types.BINARY)
    @Column(name = "evidence", columnDefinition = "bytea")
    private byte[] evidence;

    private String evidenceFileName;

    private String evidenceContentType;


    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private LocalDateTime createdAt;

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
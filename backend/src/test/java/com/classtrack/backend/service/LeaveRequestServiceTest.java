package com.classtrack.backend.service;

import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.entity.Role;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.ClassroomRepository;
import com.classtrack.backend.repository.EnrollmentRepository;
import com.classtrack.backend.repository.LeaveRequestRepository;
import com.classtrack.backend.utils.FileDatabaseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveRequestServiceTest {

    @Mock
    private LeaveRequestRepository repo;

    @Mock
    private ClassroomRepository classroomRepo;

    @Mock
    private EnrollmentRepository enrollmentRepo;

    @Mock
    private FileDatabaseService fileDatabaseService;

    @InjectMocks
    private LeaveRequestService leaveRequestService;

    private User student;
    private User instructor;
    private Classroom classroom;
    private LeaveRequest leaveRequest;

    @BeforeEach
    void setUp() {
        instructor = User.builder()
                .id(1L)
                .email("instructor@example.com")
                .fullName("Instructor Name")
                .role(Role.INSTRUCTOR)
                .build();

        student = User.builder()
                .id(2L)
                .email("student@example.com")
                .fullName("Student Name")
                .role(Role.STUDENT)
                .build();

        classroom = Classroom.builder()
                .id("CS101")
                .name("Introduction to Programming")
                .instructor(instructor)
                .build();

        leaveRequest = LeaveRequest.builder()
                .id(1L)
                .student(student)
                .classroom(classroom)
                .absenceDate(LocalDate.now().plusDays(1))
                .reason("Sick")
                .status(LeaveRequest.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ==================== SUBMIT REQUEST TESTS ====================

    @Test
    void submitRequest_ShouldCreateLeaveRequest_WhenValidInput() {
        // Given
        LocalDate futureDate = LocalDate.now().plusDays(1);
        String reason = "Medical appointment";

        when(classroomRepo.findById("CS101")).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.existsByStudentAndClassroom(student, classroom)).thenReturn(true);
        when(repo.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        // When
        LeaveRequest result = leaveRequestService.submitRequest(student, "CS101", futureDate, reason, null);

        // Then
        assertThat(result).isNotNull();
        verify(repo).save(any(LeaveRequest.class));
        verify(classroomRepo).findById("CS101");
        verify(enrollmentRepo).existsByStudentAndClassroom(student, classroom);
    }

    @Test
    void submitRequest_ShouldThrowException_WhenClassroomNotFound() {
        // Given
        when(classroomRepo.findById("INVALID")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.submitRequest(
                student, "INVALID", LocalDate.now().plusDays(1), "Sick", null
        ))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Class not found");

        verify(repo, never()).save(any());
    }

    @Test
    void submitRequest_ShouldThrowException_WhenNotEnrolled() {
        // Given
        when(classroomRepo.findById("CS101")).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.existsByStudentAndClassroom(student, classroom)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.submitRequest(
                student, "CS101", LocalDate.now().plusDays(1), "Sick", null
        ))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You are not enrolled in this class");

        verify(repo, never()).save(any());
    }

    @Test
    void submitRequest_ShouldThrowException_WhenAbsenceDateInPast() {
        // Given
        LocalDate pastDate = LocalDate.now().minusDays(1);
        when(classroomRepo.findById("CS101")).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.existsByStudentAndClassroom(student, classroom)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.submitRequest(
                student, "CS101", pastDate, "Sick", null
        ))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Absence date must be today or in the future");

        verify(repo, never()).save(any());
    }

    // ==================== DELETE REQUEST TESTS ====================

    @Test
    void deleteLeaveRequest_ShouldDeleteRequest_WhenValidConditions() {
        // Given
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        // When
        leaveRequestService.deleteLeaveRequest(1L, student);

        // Then
        verify(repo).delete(leaveRequest);
    }

    @Test
    void deleteLeaveRequest_ShouldThrowException_WhenNotOwner() {
        // Given
        User otherStudent = User.builder().id(99L).build();
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.deleteLeaveRequest(1L, otherStudent))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You can only delete your own request");

        verify(repo, never()).delete(any());
    }

    @Test
    void deleteLeaveRequest_ShouldThrowException_WhenAlreadyProcessed() {
        // Given
        leaveRequest.setStatus(LeaveRequest.Status.APPROVED);
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.deleteLeaveRequest(1L, student))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot delete request that has been processed");

        verify(repo, never()).delete(any());
    }

    // ==================== APPROVE REQUEST TESTS ====================

    @Test
    void approveRequest_ShouldApproveRequest_WhenValid() {
        // Given
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));
        when(repo.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        ArgumentCaptor<LeaveRequest> captor = ArgumentCaptor.forClass(LeaveRequest.class);

        // When
        LeaveRequest result = leaveRequestService.approveRequest(1L, instructor);

        // Then
        verify(repo).save(captor.capture());
        LeaveRequest saved = captor.getValue();

        assertThat(saved.getStatus()).isEqualTo(LeaveRequest.Status.APPROVED);
        assertThat(saved.getApprovedBy()).isEqualTo(instructor);
        assertThat(saved.getApprovedAt()).isNotNull();
        assertThat(saved.getDenialReason()).isNull();
    }

    @Test
    void approveRequest_ShouldThrowException_WhenNotAuthorized() {
        // Given
        User otherInstructor = User.builder().id(99L).build();
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.approveRequest(1L, otherInstructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Not authorized to approve this request");

        verify(repo, never()).save(any());
    }

    @Test
    void approveRequest_ShouldThrowException_WhenAlreadyProcessed() {
        // Given
        leaveRequest.setStatus(LeaveRequest.Status.APPROVED);
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.approveRequest(1L, instructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Request already processed");

        verify(repo, never()).save(any());
    }

    // ==================== DENY REQUEST TESTS ====================

    @Test
    void denyRequest_ShouldDenyRequest_WhenValid() {
        // Given
        String denialReason = "Insufficient evidence";
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));
        when(repo.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        ArgumentCaptor<LeaveRequest> captor = ArgumentCaptor.forClass(LeaveRequest.class);

        // When
        LeaveRequest result = leaveRequestService.denyRequest(1L, denialReason, instructor);

        // Then
        verify(repo).save(captor.capture());
        LeaveRequest saved = captor.getValue();

        assertThat(saved.getStatus()).isEqualTo(LeaveRequest.Status.REJECTED);
        assertThat(saved.getApprovedBy()).isEqualTo(instructor);
        assertThat(saved.getApprovedAt()).isNotNull();
        assertThat(saved.getDenialReason()).isEqualTo(denialReason);
    }

    @Test
    void denyRequest_ShouldThrowException_WhenDenialReasonEmpty() {
        // Given
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.denyRequest(1L, "   ", instructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Denial reason is required");

        verify(repo, never()).save(any());
    }

    @Test
    void denyRequest_ShouldThrowException_WhenNotAuthorized() {
        // Given
        User otherInstructor = User.builder().id(99L).build();
        when(repo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.denyRequest(1L, "reason", otherInstructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Not authorized to deny this request");

        verify(repo, never()).save(any());
    }

    // ==================== GET REQUESTS TESTS ====================

    @Test
    void getMyRequests_ShouldReturnRequests() {
        // Given
        List<LeaveRequest> requests = Arrays.asList(leaveRequest);
        when(repo.findByStudent(student)).thenReturn(requests);

        // When
        List<LeaveRequest> result = leaveRequestService.getMyRequests(student);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(leaveRequest);
    }

    @Test
    void getPendingRequestsForClass_ShouldReturnRequests_WhenAuthorized() {
        // Given
        when(classroomRepo.findById("CS101")).thenReturn(Optional.of(classroom));
        when(repo.findByClassroomAndStatus(classroom, LeaveRequest.Status.PENDING))
                .thenReturn(Arrays.asList(leaveRequest));

        // When
        List<LeaveRequest> result = leaveRequestService.getPendingRequestsForClass(
                "CS101", null, null, instructor
        );

        // Then
        assertThat(result).hasSize(1);
        verify(repo).findByClassroomAndStatus(classroom, LeaveRequest.Status.PENDING);
    }

    @Test
    void getPendingRequestsForClass_ShouldThrowException_WhenNotAuthorized() {
        // Given
        User otherInstructor = User.builder().id(99L).build();
        when(classroomRepo.findById("CS101")).thenReturn(Optional.of(classroom));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.getPendingRequestsForClass(
                "CS101", null, null, otherInstructor
        ))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Not authorized");
    }

    @Test
    void getLeaveRequestsByClassroom_ShouldReturnRequests_WhenAuthorized() {
        // Given
        when(classroomRepo.findById("CS101")).thenReturn(Optional.of(classroom));
        when(repo.findByClassroomOrderByCreatedAtDesc(classroom))
                .thenReturn(Arrays.asList(leaveRequest));

        // When
        List<LeaveRequest> result = leaveRequestService.getLeaveRequestsByClassroom("CS101", instructor);

        // Then
        assertThat(result).hasSize(1);
        verify(repo).findByClassroomOrderByCreatedAtDesc(classroom);
    }

    @Test
    void getLeaveRequestsByClassroom_ShouldThrowException_WhenNotAuthorized() {
        // Given
        User otherInstructor = User.builder().id(99L).build();
        when(classroomRepo.findById("CS101")).thenReturn(Optional.of(classroom));

        // When & Then
        assertThatThrownBy(() -> leaveRequestService.getLeaveRequestsByClassroom("CS101", otherInstructor))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You are not the instructor of this classroom");
    }

    @Test
    void getAllLeaveRequestsForInstructor_ShouldReturnRequests() {
        // Given
        when(repo.findByClassroomInstructorOrderByCreatedAtDesc(instructor))
                .thenReturn(Arrays.asList(leaveRequest));

        // When
        List<LeaveRequest> result = leaveRequestService.getAllLeaveRequestsForInstructor(instructor);

        // Then
        assertThat(result).hasSize(1);
        verify(repo).findByClassroomInstructorOrderByCreatedAtDesc(instructor);
    }
}
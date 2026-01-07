package com.classtrack.backend.controller;

import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.entity.Role;
import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.service.LeaveRequestService;
import com.classtrack.backend.repository.UserRepository;
import com.classtrack.backend.repository.LeaveRequestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LeaveRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LeaveRequestService service;

    @MockBean
    private UserRepository userRepo;

    @MockBean
    private LeaveRequestRepository leaveRequestRepo;

    private User student;
    private User instructor;
    private Classroom classroom;
    private LeaveRequest leaveRequest;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@test.com")
                .fullName("Test Student")
                .role(Role.STUDENT)
                .build();

        instructor = User.builder()
                .id(2L)
                .email("instructor@test.com")
                .fullName("Test Instructor")
                .role(Role.INSTRUCTOR)
                .build();

        classroom = Classroom.builder()
                .id("CLASS001")
                .name("Test Class")
                .instructor(instructor)
                .build();

        leaveRequest = LeaveRequest.builder()
                .id(1L)
                .student(student)
                .classroom(classroom)
                .absenceDate(LocalDate.now())
                .reason("Malade")
                .status(LeaveRequest.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void submitLeaveRequest_Success() throws Exception {
        MockMultipartFile evidence = new MockMultipartFile(
                "evidence", "certificate.pdf", "application/pdf", "test content".getBytes());

        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(service.submitRequest(any(), eq("CLASS001"), any(), eq("Malade"), any()))
                .thenReturn(leaveRequest);

        mockMvc.perform(multipart("/api/leave-request/submit")
                        .file(evidence)
                        .param("classroomId", "CLASS001")
                        .param("absenceDate", "2025-12-31")
                        .param("reason", "Malade")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(service).submitRequest(any(), eq("CLASS001"), any(), eq("Malade"), any());
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void getMyRequests_Success() throws Exception {
        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(service.getMyRequestsWithFilter(any(), any(), any()))
                .thenReturn(List.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/my-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void getPendingRequests_Success() throws Exception {
        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(instructor));
        when(service.getPendingRequestsForClass(eq("CLASS001"), any(), any(), any()))
                .thenReturn(List.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/CLASS001/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void approveRequest_Success() throws Exception {
        LeaveRequest approved = LeaveRequest.builder()
                .id(1L)
                .student(student)
                .classroom(classroom)
                .status(LeaveRequest.Status.APPROVED)
                .approvedBy(instructor)
                .approvedAt(LocalDateTime.now())
                .build();

        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(instructor));
        when(service.approveRequest(1L, instructor)).thenReturn(approved);

        mockMvc.perform(post("/api/leave-request/1/approve")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        verify(service).approveRequest(1L, instructor);
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void denyRequest_Success() throws Exception {
        LeaveRequest denied = LeaveRequest.builder()
                .id(1L)
                .student(student)
                .classroom(classroom)
                .status(LeaveRequest.Status.REJECTED)
                .denialReason("Evidence insuffisante")
                .build();

        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(instructor));
        when(service.denyRequest(eq(1L), eq("Evidence insuffisante"), any())).thenReturn(denied);

        mockMvc.perform(post("/api/leave-request/1/deny")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"denialReason\":\"Evidence insuffisante\"}")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void deleteRequest_Success() throws Exception {
        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        doNothing().when(service).deleteLeaveRequest(1L, student);

        mockMvc.perform(delete("/api/leave-request/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(service).deleteLeaveRequest(1L, student);
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void getRequestDetail_Success() throws Exception {
        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(leaveRequestRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void getRequestDetail_NotOwner_ThrowsException() throws Exception {
        User anotherStudent = User.builder()
                .id(3L)
                .email("student@test.com")
                .build();

        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.of(anotherStudent));
        when(leaveRequestRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void getLeaveRequestsByClassroom_Success() throws Exception {
        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(instructor));
        when(service.getLeaveRequestsByClassroom("CLASS001", instructor))
                .thenReturn(List.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/classroom/CLASS001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void getAllMyLeaveRequests_Success() throws Exception {
        LeaveRequest request2 = LeaveRequest.builder()
                .id(2L)
                .student(student)
                .classroom(classroom)
                .absenceDate(LocalDate.now().plusDays(1))
                .reason("Rendez-vous médical")
                .status(LeaveRequest.Status.PENDING)
                .build();

        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(instructor));
        when(service.getAllLeaveRequestsForInstructor(instructor))
                .thenReturn(List.of(leaveRequest, request2));

        mockMvc.perform(get("/api/leave-request/my-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void getRequestDetailForInstructor_Success() throws Exception {
        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(instructor));
        when(leaveRequestRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/instructor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void getRequestDetailForInstructor_NotAuthorized_ThrowsException() throws Exception {
        User anotherInstructor = User.builder()
                .id(99L)
                .email("instructor@test.com")
                .role(Role.INSTRUCTOR)
                .build();

        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(anotherInstructor));
        when(leaveRequestRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/instructor/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void getMyRequests_WithDateFilter_Success() throws Exception {
        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(service.getMyRequestsWithFilter(eq(student), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/my-requests")
                        .param("startDate", "2025-12-29")
                        .param("endDate", "2026-01-04"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void getPendingRequests_WithDateFilter_Success() throws Exception {
        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.of(instructor));
        when(service.getPendingRequestsForClass(eq("CLASS001"), any(LocalDate.class), any(LocalDate.class), eq(instructor)))
                .thenReturn(List.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/CLASS001/pending")
                        .param("startDate", "2025-12-29")
                        .param("endDate", "2026-01-04"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void getEvidence_Success() throws Exception {
        byte[] evidenceData = "test evidence content".getBytes();
        leaveRequest.setEvidence(evidenceData);
        leaveRequest.setEvidenceFileName("certificate.pdf");
        leaveRequest.setEvidenceContentType("application/pdf");

        when(leaveRequestRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/evidence/1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"certificate.pdf\""))
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void getEvidence_NoEvidence_ReturnsNoContent() throws Exception {
        leaveRequest.setEvidence(null);

        when(leaveRequestRepo.findById(1L)).thenReturn(Optional.of(leaveRequest));

        mockMvc.perform(get("/api/leave-request/evidence/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void submitLeaveRequest_UserNotFound_ThrowsException() throws Exception {
        MockMultipartFile evidence = new MockMultipartFile(
                "evidence", "certificate.pdf", "application/pdf", "test".getBytes());

        when(userRepo.findByEmail("student@test.com")).thenReturn(Optional.empty());

        mockMvc.perform(multipart("/api/leave-request/submit")
                        .file(evidence)
                        .param("classroomId", "CLASS001")
                        .param("absenceDate", "2025-12-31")
                        .param("reason", "Malade")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "instructor@test.com", roles = "INSTRUCTOR")
    void approveRequest_UserNotFound_ThrowsException() throws Exception {
        when(userRepo.findByEmail("instructor@test.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/leave-request/1/approve")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void approveRequest_ForbiddenForStudent() throws Exception {
        mockMvc.perform(post("/api/leave-request/1/approve")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "INSTRUCTOR")
    void submitLeaveRequest_ForbiddenForInstructor() throws Exception {
        MockMultipartFile evidence = new MockMultipartFile(
                "evidence", "certificate.pdf", "application/pdf", "test".getBytes());

        mockMvc.perform(multipart("/api/leave-request/submit")
                        .file(evidence)
                        .param("classroomId", "CLASS001")
                        .param("absenceDate", "2025-12-31")
                        .param("reason", "Malade")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
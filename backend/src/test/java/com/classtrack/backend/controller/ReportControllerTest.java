package com.classtrack.backend.controller;

import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.Enrollment;
import com.classtrack.backend.entity.Role;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.ClassroomRepository;
import com.classtrack.backend.repository.EnrollmentRepository;
import com.classtrack.backend.repository.LeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClassroomRepository classroomRepository;

    @MockBean
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private LeaveRequestRepository leaveRequestRepository;

    private User instructor;
    private User student1;
    private User student2;
    private Classroom classroom;

    @BeforeEach
    void setUp() {
        instructor = User.builder()
                .id(1L)
                .email("instructor@test.com")
                .fullName("Test Instructor")
                .password("password")
                .role(Role.INSTRUCTOR)
                .build();

        student1 = User.builder()
                .id(2L)
                .email("student1@test.com")
                .fullName("Student One")
                .role(Role.STUDENT)
                .build();

        student2 = User.builder()
                .id(3L)
                .email("student2@test.com")
                .fullName("Student Two")
                .role(Role.STUDENT)
                .build();

        classroom = Classroom.builder()
                .id("CLASS001")
                .name("Test Class")
                .instructor(instructor)
                .build();
    }

    @Test
    void exportAttendanceReport_Success() throws Exception {
        Enrollment enrollment1 = Enrollment.builder()
                .student(student1)
                .classroom(classroom)
                .build();

        Enrollment enrollment2 = Enrollment.builder()
                .student(student2)
                .classroom(classroom)
                .build();

        // Student 1: 5 total, 3 approved, 1 rejected, 1 pending
        Object[] agg1 = {2L, 5L, 3L, 1L};
        // Student 2: 2 total, 1 approved, 0 rejected, 1 pending
        Object[] agg2 = {3L, 2L, 1L, 0L};

        when(classroomRepository.findById("CLASS001")).thenReturn(Optional.of(classroom));
        when(enrollmentRepository.findByClassroomId("CLASS001"))
                .thenReturn(List.of(enrollment1, enrollment2));
        when(leaveRequestRepository.getAttendanceAggregates(
                eq("CLASS001"),
                any(LocalDate.class),
                any(LocalDate.class)))
                .thenReturn(List.of(agg1, agg2));

        mockMvc.perform(get("/api/report/CLASS001/attendance-report")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31")
                        .with(SecurityMockMvcRequestPostProcessors.user(instructor)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=attendance_report_CLASS001.csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Student Email,Full Name")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("student1@test.com")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Student One")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("student2@test.com")));

        verify(leaveRequestRepository).getAttendanceAggregates(
                eq("CLASS001"),
                any(LocalDate.class),
                any(LocalDate.class));
    }

    @Test
    void exportAttendanceReport_ClassroomNotFound_ThrowsException() throws Exception {
        when(classroomRepository.findById("INVALID")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/report/INVALID/attendance-report")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31")
                        .with(SecurityMockMvcRequestPostProcessors.user(instructor)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void exportAttendanceReport_NotClassroomInstructor_ThrowsException() throws Exception {
        User anotherInstructor = User.builder()
                .id(99L)
                .email("anotherinstructor@test.com")
                .password("password")
                .role(Role.INSTRUCTOR)
                .build();

        when(classroomRepository.findById("CLASS001")).thenReturn(Optional.of(classroom));

        mockMvc.perform(get("/api/report/CLASS001/attendance-report")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31")
                        .with(SecurityMockMvcRequestPostProcessors.user(anotherInstructor)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void exportAttendanceReport_NoEnrollments_Success() throws Exception {
        when(classroomRepository.findById("CLASS001")).thenReturn(Optional.of(classroom));
        when(enrollmentRepository.findByClassroomId("CLASS001")).thenReturn(List.of());
        when(leaveRequestRepository.getAttendanceAggregates(
                eq("CLASS001"),
                any(LocalDate.class),
                any(LocalDate.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/report/CLASS001/attendance-report")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31")
                        .with(SecurityMockMvcRequestPostProcessors.user(instructor)))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Student Email,Full Name")));
    }

    @Test
    void exportAttendanceReport_StudentWithNoRequests_ShowsZeros() throws Exception {
        Enrollment enrollment1 = Enrollment.builder()
                .student(student1)
                .classroom(classroom)
                .build();

        when(classroomRepository.findById("CLASS001")).thenReturn(Optional.of(classroom));
        when(enrollmentRepository.findByClassroomId("CLASS001"))
                .thenReturn(List.of(enrollment1));
        when(leaveRequestRepository.getAttendanceAggregates(
                eq("CLASS001"),
                any(LocalDate.class),
                any(LocalDate.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/report/CLASS001/attendance-report")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31")
                        .with(SecurityMockMvcRequestPostProcessors.user(instructor)))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("student1@test.com,Student One,0,0,0,0")));
    }

    @Test
    void exportAttendanceReport_ForbiddenForStudent() throws Exception {
        User student = User.builder()
                .id(10L)
                .email("student@test.com")
                .password("password")
                .role(Role.STUDENT)
                .build();

        mockMvc.perform(get("/api/report/CLASS001/attendance-report")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31")
                        .with(SecurityMockMvcRequestPostProcessors.user(student)))
                .andExpect(status().isForbidden());
    }

    @Test
    void exportAttendanceReport_MissingDateParams_BadRequest() throws Exception {
        mockMvc.perform(get("/api/report/CLASS001/attendance-report")
                        .with(SecurityMockMvcRequestPostProcessors.user(instructor)))
                .andExpect(status().isBadRequest());
    }
}
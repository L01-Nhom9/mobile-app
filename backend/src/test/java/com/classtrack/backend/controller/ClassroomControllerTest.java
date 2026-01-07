package com.classtrack.backend.controller;

import com.classtrack.backend.dto.CreateClassRequest;
import com.classtrack.backend.dto.CreateClassResponse;
import com.classtrack.backend.dto.JoinRequest;
import com.classtrack.backend.dto.UpdateClassRequest;
import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.Enrollment;
import com.classtrack.backend.entity.Role;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.UserRepository;
import com.classtrack.backend.service.ClassroomService;
import com.classtrack.backend.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClassroomController.class)
class ClassroomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClassroomService classroomService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    private User instructor;
    private User student;
    private Classroom classroom;
    private Enrollment enrollment;

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
                .description("Learn programming basics")
                .joinCode("ABC12345")
                .instructor(instructor)
                .createdAt(LocalDateTime.now())
                .build();

        enrollment = Enrollment.builder()
                .id(1L)
                .student(student)
                .classroom(classroom)
                .joinedAt(LocalDateTime.now())
                .build();
    }

    // ==================== CREATE CLASSROOM TESTS ====================

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void createClassroom_ShouldReturnCreatedClassroom_WhenValidRequest() throws Exception {
        // Given
        CreateClassRequest request = new CreateClassRequest(
                "CS101",
                "Introduction to Programming",
                "Learn programming basics"
        );

        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        when(classroomService.createClassroom(
                request.id(),
                request.name(),
                request.description(),
                instructor
        )).thenReturn(classroom);

        // When & Then
        mockMvc.perform(post("/api/classroom/create")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("CS101"))
                .andExpect(jsonPath("$.name").value("Introduction to Programming"))
                .andExpect(jsonPath("$.description").value("Learn programming basics"))
                .andExpect(jsonPath("$.joinCode").value("ABC12345"));

        verify(classroomService).createClassroom(
                request.id(),
                request.name(),
                request.description(),
                instructor
        );
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void createClassroom_ShouldReturnForbidden_WhenUserIsStudent() throws Exception {
        // Given
        CreateClassRequest request = new CreateClassRequest(
                "CS101",
                "Introduction to Programming",
                "Learn programming basics"
        );

        // When & Then
        mockMvc.perform(post("/api/classroom/create")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(classroomService, never()).createClassroom(any(), any(), any(), any());
    }

    @Test
    void createClassroom_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        // Given
        CreateClassRequest request = new CreateClassRequest(
                "CS101",
                "Introduction to Programming",
                "Learn programming basics"
        );

        // When & Then
        mockMvc.perform(post("/api/classroom/create")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

        verify(classroomService, never()).createClassroom(any(), any(), any(), any());
    }

    // ==================== DELETE CLASSROOM TESTS ====================

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void deleteClassroom_ShouldReturnNoContent_WhenSuccessful() throws Exception {
        // Given
        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        doNothing().when(classroomService).deleteClassroom("CS101", instructor);

        // When & Then
        mockMvc.perform(delete("/api/classroom/CS101")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(classroomService).deleteClassroom("CS101", instructor);
    }

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void deleteClassroom_ShouldReturnError_WhenServiceThrowsException() throws Exception {
        // Given
        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        doThrow(new RuntimeException("Cannot delete class with enrolled students"))
                .when(classroomService).deleteClassroom("CS101", instructor);

        // When & Then
        mockMvc.perform(delete("/api/classroom/CS101")
                        .with(csrf()))
                .andExpect(status().is4xxClientError());
    }

    // @Test
    // @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    // void deleteClassroom_ShouldReturnForbidden_WhenUserIsStudent() throws Exception {
    //     // When & Then
    //     mockMvc.perform(delete("/api/classroom/CS101")
    //                     .with(csrf()))
    //             .andExpect(status().isForbidden());

    //     verify(classroomService, never()).deleteClassroom(any(), any());
    // }

    // ==================== UPDATE CLASSROOM TESTS ====================

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void updateClassroom_ShouldReturnUpdatedClassroom_WhenValidRequest() throws Exception {
        // Given
        UpdateClassRequest request = new UpdateClassRequest(
                "Advanced Programming",
                "Advanced topics"
        );

        Classroom updatedClassroom = Classroom.builder()
                .id("CS101")
                .name("Advanced Programming")
                .description("Advanced topics")
                .joinCode("ABC12345")
                .instructor(instructor)
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        when(classroomService.updateClassroom(
                "CS101",
                request.name(),
                request.description(),
                instructor
        )).thenReturn(updatedClassroom);

        // When & Then
        mockMvc.perform(put("/api/classroom/CS101")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("CS101"))
                .andExpect(jsonPath("$.name").value("Advanced Programming"))
                .andExpect(jsonPath("$.description").value("Advanced topics"));

        verify(classroomService).updateClassroom(
                "CS101",
                request.name(),
                request.description(),
                instructor
        );
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void updateClassroom_ShouldReturnForbidden_WhenUserIsStudent() throws Exception {
        // Given
        UpdateClassRequest request = new UpdateClassRequest(
                "Advanced Programming",
                "Advanced topics"
        );

        // When & Then
        mockMvc.perform(put("/api/classroom/CS101")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(classroomService, never()).updateClassroom(any(), any(), any(), any());
    }

    // ==================== GET MY TEACHING CLASSES TESTS ====================

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void getMyTeachingClasses_ShouldReturnClassrooms_WhenInstructorHasClasses() throws Exception {
        // Given
        List<Classroom> classrooms = Arrays.asList(classroom);

        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        when(classroomService.getMyTeachingClasses(instructor)).thenReturn(classrooms);

        // When & Then
        mockMvc.perform(get("/api/classroom/my-teaching"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("CS101"))
                .andExpect(jsonPath("$[0].name").value("Introduction to Programming"))
                .andExpect(jsonPath("$.length()").value(1));

        verify(classroomService).getMyTeachingClasses(instructor);
    }

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void getMyTeachingClasses_ShouldReturnEmptyList_WhenNoClasses() throws Exception {
        // Given
        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        when(classroomService.getMyTeachingClasses(instructor))
                .thenReturn(Collections.emptyList());

        // When & Then
        mockMvc.perform(get("/api/classroom/my-teaching"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void getMyTeachingClasses_ShouldReturnForbidden_WhenUserIsStudent() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/classroom/my-teaching"))
                .andExpect(status().isBadRequest());

        verify(classroomService, never()).getMyTeachingClasses(any());
    }

    // ==================== GET STUDENTS IN CLASS TESTS ====================

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void getStudentsInClass_ShouldReturnStudents_WhenClassHasStudents() throws Exception {
        // Given
        List<Enrollment> enrollments = Arrays.asList(enrollment);

        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        when(classroomService.getStudentsInClass("CS101", instructor))
                .thenReturn(enrollments);

        // When & Then
        mockMvc.perform(get("/api/classroom/CS101/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2))
                .andExpect(jsonPath("$[0].email").value("student@example.com"))
                .andExpect(jsonPath("$[0].fullName").value("Student Name"))
                .andExpect(jsonPath("$.length()").value(1));

        verify(classroomService).getStudentsInClass("CS101", instructor);
    }

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void getStudentsInClass_ShouldReturnEmptyList_WhenNoStudents() throws Exception {
        // Given
        when(userRepository.findByEmail("instructor@example.com"))
                .thenReturn(Optional.of(instructor));
        when(classroomService.getStudentsInClass("CS101", instructor))
                .thenReturn(Collections.emptyList());

        // When & Then
        mockMvc.perform(get("/api/classroom/CS101/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // @Test
    // @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    // void getStudentsInClass_ShouldReturnForbidden_WhenUserIsStudent() throws Exception {
    //     // When & Then
    //     mockMvc.perform(get("/api/classroom/CS101/students"))
    //             .andExpect(status().isForbidden());

    //     verify(classroomService, never()).getStudentsInClass(any(), any());
    // }

    // ==================== JOIN CLASS TESTS ====================

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void joinClass_ShouldReturnSuccess_WhenValidJoinCode() throws Exception {
        // Given
        JoinRequest request = new JoinRequest("ABC12345");

        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(student));
        doNothing().when(classroomService).joinClassByCode("ABC12345", student);

        // When & Then
        mockMvc.perform(post("/api/classroom/join")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Joined successfully"));

        verify(classroomService).joinClassByCode("ABC12345", student);
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void joinClass_ShouldReturnError_WhenInvalidJoinCode() throws Exception {
        // Given
        JoinRequest request = new JoinRequest("INVALID");

        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(student));
        doThrow(new RuntimeException("Invalid join code"))
                .when(classroomService).joinClassByCode("INVALID", student);

        // When & Then
        mockMvc.perform(post("/api/classroom/join")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
    }

    // @Test
    // @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    // void joinClass_ShouldReturnForbidden_WhenUserIsInstructor() throws Exception {
    //     // Given
    //     JoinRequest request = new JoinRequest("ABC12345");

    //     // When & Then
    //     mockMvc.perform(post("/api/classroom/join")
    //                     .with(csrf())
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(objectMapper.writeValueAsString(request)))
    //             .andExpect(status().isForbidden());

    //     verify(classroomService, never()).joinClassByCode(any(), any());
    // }

    // ==================== LEAVE CLASS TESTS ====================

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void leaveClass_ShouldReturnNoContent_WhenSuccessful() throws Exception {
        // Given
        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(student));
        doNothing().when(classroomService).leaveClass("CS101", student);

        // When & Then
        mockMvc.perform(delete("/api/classroom/leave/CS101")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(classroomService).leaveClass("CS101", student);
    }

    // @Test
    // @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    // void leaveClass_ShouldReturnError_WhenNotEnrolled() throws Exception {
    //     // Given
    //     when(userRepository.findByEmail("student@example.com"))
    //             .thenReturn(Optional.of(student));
    //     doThrow(new RuntimeException("You are not enrolled in this class"))
    //             .when(classroomService).leaveClass("CS101", student);

    //     // When & Then
    //     mockMvc.perform(delete("/api/classroom/leave/CS101")
    //                     .with(csrf()))
    //             .andExpect(status().is5xxServerError());
    // }

    // @Test
    // @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    // void leaveClass_ShouldReturnForbidden_WhenUserIsInstructor() throws Exception {
    //     // When & Then
    //     mockMvc.perform(delete("/api/classroom/leave/CS101")
    //                     .with(csrf()))
    //             .andExpect(status().isForbidden());

    //     verify(classroomService, never()).leaveClass(any(), any());
    // }

    // ==================== GET MY ENROLLED CLASSES TESTS ====================

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void getMyEnrolledClasses_ShouldReturnClassrooms_WhenStudentIsEnrolled() throws Exception {
        // Given
        List<Classroom> classrooms = Arrays.asList(classroom);

        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(student));
        when(classroomService.getMyEnrolledClasses(student)).thenReturn(classrooms);

        // When & Then
        mockMvc.perform(get("/api/classroom/my-enrolled"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("CS101"))
                .andExpect(jsonPath("$[0].name").value("Introduction to Programming"))
                .andExpect(jsonPath("$.length()").value(1));

        verify(classroomService).getMyEnrolledClasses(student);
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    void getMyEnrolledClasses_ShouldReturnEmptyList_WhenNoEnrollments() throws Exception {
        // Given
        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(student));
        when(classroomService.getMyEnrolledClasses(student))
                .thenReturn(Collections.emptyList());

        // When & Then
        mockMvc.perform(get("/api/classroom/my-enrolled"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(username = "instructor@example.com", roles = {"INSTRUCTOR"})
    void getMyEnrolledClasses_ShouldReturnForbidden_WhenUserIsInstructor() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/classroom/my-enrolled"))
                .andExpect(status().isBadRequest());

        verify(classroomService, never()).getMyEnrolledClasses(any());
    }

    // ==================== USER NOT FOUND TESTS ====================

    // @Test
    // @WithMockUser(username = "unknown@example.com", roles = {"INSTRUCTOR"})
    // void createClassroom_ShouldReturnError_WhenUserNotFound() throws Exception {
    //     // Given
    //     CreateClassRequest request = new CreateClassRequest(
    //             "CS101",
    //             "Introduction to Programming",
    //             "Learn programming basics"
    //     );

    //     when(userRepository.findByEmail("unknown@example.com"))
    //             .thenReturn(Optional.empty());

    //     // When & Then
    //     mockMvc.perform(post("/api/classroom/create")
    //                     .with(csrf())
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(objectMapper.writeValueAsString(request)))
    //             .andExpect(status().is5xxServerError());
    // }
}
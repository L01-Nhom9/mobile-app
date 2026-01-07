package com.classtrack.backend.service;

import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.Enrollment;
import com.classtrack.backend.entity.Role;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.repository.ClassroomRepository;
import com.classtrack.backend.repository.EnrollmentRepository;
import com.classtrack.backend.repository.LeaveRequestRepository;
import com.classtrack.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClassroomServiceTest {

    @Mock
    private ClassroomRepository classroomRepo;

    @Mock
    private EnrollmentRepository enrollmentRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private LeaveRequestRepository leaveRequestRepo;

    @Mock
    private JoinCodeGenerator codeGenerator;

    @InjectMocks
    private ClassroomService classroomService;

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
                .enrollments(new HashSet<>())
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
    void createClassroom_ShouldReturnClassroom_WhenValidInput() {
        // Given
        String classId = "CS101";
        String name = "Introduction to Programming";
        String description = "Learn programming basics";
        String joinCode = "ABC12345";

        when(codeGenerator.generate()).thenReturn(joinCode);
        when(classroomRepo.findByJoinCode(joinCode)).thenReturn(Optional.empty());
        when(classroomRepo.save(any(Classroom.class))).thenReturn(classroom);

        // When
        Classroom result = classroomService.createClassroom(classId, name, description, instructor);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(classId);
        assertThat(result.getName()).isEqualTo(name);
        assertThat(result.getDescription()).isEqualTo(description);
        assertThat(result.getInstructor()).isEqualTo(instructor);

        verify(codeGenerator).generate();
        verify(classroomRepo).findByJoinCode(joinCode);
        verify(classroomRepo).save(any(Classroom.class));
    }

    @Test
    void createClassroom_ShouldGenerateUniqueJoinCode_WhenDuplicateExists() {
        // Given
        String duplicateCode = "DUP12345";
        String uniqueCode = "UNQ12345";

        when(codeGenerator.generate()).thenReturn(duplicateCode, uniqueCode);
        when(classroomRepo.findByJoinCode(duplicateCode)).thenReturn(Optional.of(classroom));
        when(classroomRepo.findByJoinCode(uniqueCode)).thenReturn(Optional.empty());
        when(classroomRepo.save(any(Classroom.class))).thenReturn(classroom);

        // When
        classroomService.createClassroom("CS101", "Test", "Desc", instructor);

        // Then
        verify(codeGenerator, times(2)).generate();
        verify(classroomRepo).findByJoinCode(duplicateCode);
        verify(classroomRepo).findByJoinCode(uniqueCode);
    }

    @Test
    void createClassroom_ShouldSetCreatedAt() {
        // Given
        when(codeGenerator.generate()).thenReturn("CODE1234");
        when(classroomRepo.findByJoinCode(any())).thenReturn(Optional.empty());
        when(classroomRepo.save(any(Classroom.class))).thenReturn(classroom);

        ArgumentCaptor<Classroom> classroomCaptor = ArgumentCaptor.forClass(Classroom.class);

        // When
        classroomService.createClassroom("CS101", "Test", "Desc", instructor);

        // Then
        verify(classroomRepo).save(classroomCaptor.capture());
        Classroom savedClassroom = classroomCaptor.getValue();
        assertThat(savedClassroom.getCreatedAt()).isNotNull();
    }

    // ==================== DELETE CLASSROOM TESTS ====================

    @Test
    void deleteClassroom_ShouldDeleteClassroom_WhenValidConditions() {
        // Given
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(leaveRequestRepo.findByClassroom(classroom)).thenReturn(Collections.emptyList());

        // When
        classroomService.deleteClassroom(classroom.getId(), instructor);

        // Then
        verify(classroomRepo).delete(classroom);
    }

    @Test
    void deleteClassroom_ShouldThrowException_WhenClassroomNotFound() {
        // Given
        when(classroomRepo.findById("INVALID")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> classroomService.deleteClassroom("INVALID", instructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Class not found");

        verify(classroomRepo, never()).delete(any());
    }

    @Test
    void deleteClassroom_ShouldThrowException_WhenNotClassroomOwner() {
        // Given
        User otherInstructor = User.builder()
                .id(99L)
                .email("other@example.com")
                .role(Role.INSTRUCTOR)
                .build();

        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));

        // When & Then
        assertThatThrownBy(() -> classroomService.deleteClassroom(classroom.getId(), otherInstructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You can only delete your own class");

        verify(classroomRepo, never()).delete(any());
    }

    @Test
    void deleteClassroom_ShouldThrowException_WhenHasEnrolledStudents() {
        // Given
        classroom.getEnrollments().add(enrollment);
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));

        // When & Then
        assertThatThrownBy(() -> classroomService.deleteClassroom(classroom.getId(), instructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot delete class with enrolled students");

        verify(classroomRepo, never()).delete(any());
    }

    @Test
    void deleteClassroom_ShouldThrowException_WhenHasLeaveRequests() {
        // Given
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(leaveRequestRepo.findByClassroom(classroom)).thenReturn(List.of(mock(LeaveRequest.class)));

        // When & Then
        assertThatThrownBy(() -> classroomService.deleteClassroom(classroom.getId(), instructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot delete class with leave requests");

        verify(classroomRepo, never()).delete(any());
    }

    // ==================== UPDATE CLASSROOM TESTS ====================

    @Test
    void updateClassroom_ShouldUpdateNameAndDescription_WhenValidInput() {
        // Given
        String newName = "Advanced Programming";
        String newDescription = "Advanced topics";

        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(classroomRepo.save(any(Classroom.class))).thenReturn(classroom);

        // When
        Classroom result = classroomService.updateClassroom(
                classroom.getId(), newName, newDescription, instructor
        );

        // Then
        verify(classroomRepo).save(any(Classroom.class));
        assertThat(classroom.getName()).isEqualTo(newName);
        assertThat(classroom.getDescription()).isEqualTo(newDescription);
    }

    @Test
    void updateClassroom_ShouldThrowException_WhenClassroomNotFound() {
        // Given
        when(classroomRepo.findById("INVALID")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> classroomService.updateClassroom(
                "INVALID", "New Name", "New Desc", instructor
        ))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Classroom not found");

        verify(classroomRepo, never()).save(any());
    }

    @Test
    void updateClassroom_ShouldThrowException_WhenNotAuthorized() {
        // Given
        User otherInstructor = User.builder()
                .id(99L)
                .email("other@example.com")
                .role(Role.INSTRUCTOR)
                .build();

        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));

        // When & Then
        assertThatThrownBy(() -> classroomService.updateClassroom(
                classroom.getId(), "New Name", "New Desc", otherInstructor
        ))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You are not allowed to update this classroom");

        verify(classroomRepo, never()).save(any());
    }

    @Test
    void updateClassroom_ShouldNotUpdateName_WhenNameIsBlank() {
        // Given
        String originalName = classroom.getName();
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(classroomRepo.save(any(Classroom.class))).thenReturn(classroom);

        // When
        classroomService.updateClassroom(classroom.getId(), "   ", "New Desc", instructor);

        // Then
        assertThat(classroom.getName()).isEqualTo(originalName);
    }

    @Test
    void updateClassroom_ShouldNotUpdateDescription_WhenDescriptionIsNull() {
        // Given
        String originalDescription = classroom.getDescription();
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(classroomRepo.save(any(Classroom.class))).thenReturn(classroom);

        // When
        classroomService.updateClassroom(classroom.getId(), "New Name", null, instructor);

        // Then
        assertThat(classroom.getDescription()).isEqualTo(originalDescription);
    }

    // ==================== GET MY TEACHING CLASSES TESTS ====================

    @Test
    void getMyTeachingClasses_ShouldReturnClassrooms_WhenInstructorHasClasses() {
        // Given
        List<Classroom> classrooms = Arrays.asList(classroom);
        when(classroomRepo.findByInstructorId(instructor.getId())).thenReturn(classrooms);

        // When
        List<Classroom> result = classroomService.getMyTeachingClasses(instructor);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(classroom);
        verify(classroomRepo).findByInstructorId(instructor.getId());
    }

    @Test
    void getMyTeachingClasses_ShouldReturnEmptyList_WhenNoClasses() {
        // Given
        when(classroomRepo.findByInstructorId(instructor.getId())).thenReturn(Collections.emptyList());

        // When
        List<Classroom> result = classroomService.getMyTeachingClasses(instructor);

        // Then
        assertThat(result).isEmpty();
        verify(classroomRepo).findByInstructorId(instructor.getId());
    }

    // ==================== GET STUDENTS IN CLASS TESTS ====================

    @Test
    void getStudentsInClass_ShouldReturnEnrollments_WhenAuthorized() {
        // Given
        List<Enrollment> enrollments = Arrays.asList(enrollment);
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.findByClassroomId(classroom.getId())).thenReturn(enrollments);

        // When
        List<Enrollment> result = classroomService.getStudentsInClass(classroom.getId(), instructor);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(enrollment);
        verify(enrollmentRepo).findByClassroomId(classroom.getId());
    }

    @Test
    void getStudentsInClass_ShouldThrowException_WhenClassroomNotFound() {
        // Given
        when(classroomRepo.findById("INVALID")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> classroomService.getStudentsInClass("INVALID", instructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Class not found");

        verify(enrollmentRepo, never()).findByClassroomId(any());
    }

    @Test
    void getStudentsInClass_ShouldThrowException_WhenNotAuthorized() {
        // Given
        User otherInstructor = User.builder()
                .id(99L)
                .email("other@example.com")
                .role(Role.INSTRUCTOR)
                .build();

        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));

        // When & Then
        assertThatThrownBy(() -> classroomService.getStudentsInClass(classroom.getId(), otherInstructor))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Not authorized");

        verify(enrollmentRepo, never()).findByClassroomId(any());
    }

    // ==================== JOIN CLASS BY CODE TESTS ====================

    @Test
    void joinClassByCode_ShouldEnrollStudent_WhenValidJoinCode() {
        // Given
        String joinCode = "ABC12345";
        when(classroomRepo.findByJoinCode(joinCode)).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.existsByStudentAndClassroom(student, classroom)).thenReturn(false);
        when(enrollmentRepo.save(any(Enrollment.class))).thenReturn(enrollment);

        ArgumentCaptor<Enrollment> enrollmentCaptor = ArgumentCaptor.forClass(Enrollment.class);

        // When
        classroomService.joinClassByCode(joinCode, student);

        // Then
        verify(enrollmentRepo).save(enrollmentCaptor.capture());
        Enrollment savedEnrollment = enrollmentCaptor.getValue();

        assertThat(savedEnrollment.getStudent()).isEqualTo(student);
        assertThat(savedEnrollment.getClassroom()).isEqualTo(classroom);
        assertThat(savedEnrollment.getJoinedAt()).isNotNull();
    }

    @Test
    void joinClassByCode_ShouldThrowException_WhenInvalidJoinCode() {
        // Given
        String invalidCode = "INVALID";
        when(classroomRepo.findByJoinCode(invalidCode)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> classroomService.joinClassByCode(invalidCode, student))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid join code");

        verify(enrollmentRepo, never()).save(any());
    }

    @Test
    void joinClassByCode_ShouldThrowException_WhenAlreadyEnrolled() {
        // Given
        String joinCode = "ABC12345";
        when(classroomRepo.findByJoinCode(joinCode)).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.existsByStudentAndClassroom(student, classroom)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> classroomService.joinClassByCode(joinCode, student))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Already enrolled");

        verify(enrollmentRepo, never()).save(any());
    }

    // ==================== LEAVE CLASS TESTS ====================

    @Test
    void leaveClass_ShouldDeleteEnrollment_WhenValidConditions() {
        // Given
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.findByClassroomAndStudent(classroom, student))
                .thenReturn(Optional.of(enrollment));
        when(leaveRequestRepo.findByClassroomAndStudent(classroom, student))
                .thenReturn(Collections.emptyList());

        // When
        classroomService.leaveClass(classroom.getId(), student);

        // Then
        verify(enrollmentRepo).delete(enrollment);
    }

    @Test
    void leaveClass_ShouldThrowException_WhenClassroomNotFound() {
        // Given
        when(classroomRepo.findById("INVALID")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> classroomService.leaveClass("INVALID", student))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Class not found");

        verify(enrollmentRepo, never()).delete(any());
    }

    @Test
    void leaveClass_ShouldThrowException_WhenNotEnrolled() {
        // Given
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.findByClassroomAndStudent(classroom, student))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> classroomService.leaveClass(classroom.getId(), student))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You are not enrolled in this class");

        verify(enrollmentRepo, never()).delete(any());
    }

    @Test
    void leaveClass_ShouldThrowException_WhenHasPendingLeaveRequests() {
        // Given
        when(classroomRepo.findById(classroom.getId())).thenReturn(Optional.of(classroom));
        when(enrollmentRepo.findByClassroomAndStudent(classroom, student))
                .thenReturn(Optional.of(enrollment));
        when(leaveRequestRepo.findByClassroomAndStudent(classroom, student))
                .thenReturn(List.of(mock(LeaveRequest.class)));

        // When & Then
        assertThatThrownBy(() -> classroomService.leaveClass(classroom.getId(), student))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot leave class with pending leave requests");

        verify(enrollmentRepo, never()).delete(any());
    }

    // ==================== GET MY ENROLLED CLASSES TESTS ====================

    @Test
    void getMyEnrolledClasses_ShouldReturnClassrooms_WhenStudentIsEnrolled() {
        // Given
        List<Enrollment> enrollments = Arrays.asList(enrollment);
        when(enrollmentRepo.findByStudent(student)).thenReturn(enrollments);

        // When
        List<Classroom> result = classroomService.getMyEnrolledClasses(student);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(classroom);
        verify(enrollmentRepo).findByStudent(student);
    }

    @Test
    void getMyEnrolledClasses_ShouldReturnEmptyList_WhenNoEnrollments() {
        // Given
        when(enrollmentRepo.findByStudent(student)).thenReturn(Collections.emptyList());

        // When
        List<Classroom> result = classroomService.getMyEnrolledClasses(student);

        // Then
        assertThat(result).isEmpty();
        verify(enrollmentRepo).findByStudent(student);
    }

    @Test
    void getMyEnrolledClasses_ShouldReturnMultipleClassrooms_WhenMultipleEnrollments() {
        // Given
        Classroom classroom2 = Classroom.builder()
                .id("CS102")
                .name("Data Structures")
                .build();

        Enrollment enrollment2 = Enrollment.builder()
                .id(2L)
                .student(student)
                .classroom(classroom2)
                .build();

        List<Enrollment> enrollments = Arrays.asList(enrollment, enrollment2);
        when(enrollmentRepo.findByStudent(student)).thenReturn(enrollments);

        // When
        List<Classroom> result = classroomService.getMyEnrolledClasses(student);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(classroom, classroom2);
        verify(enrollmentRepo).findByStudent(student);
    }
}
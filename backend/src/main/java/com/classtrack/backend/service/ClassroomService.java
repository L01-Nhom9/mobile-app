package com.classtrack.backend.service;

import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.UserRepository;
import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.Enrollment;
import com.classtrack.backend.repository.ClassroomRepository;
import com.classtrack.backend.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final UserRepository userRepo;
    private final JoinCodeGenerator codeGenerator;


    @Transactional
    public Classroom createClassroom(String id, String name, String description, User instructor) {
        String joinCode;
        do {
            joinCode = codeGenerator.generate();
        } while (classroomRepo.findByJoinCode(joinCode).isPresent());

        Classroom classroom = Classroom.builder()
                .id(id)
                .name(name)
                .description(description)
                .joinCode(joinCode)
                .instructor(instructor)
                .createdAt(LocalDateTime.now())
                .build();

        return classroomRepo.save(classroom);
    }

    public List<Classroom> getMyTeachingClasses(User instructor) {
        return classroomRepo.findByInstructorId(instructor.getId());
    }

    public List<Enrollment> getStudentsInClass(String classroomId, User instructor) {
        Classroom classroom = classroomRepo.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        if (!classroom.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("Not authorized");
        }
        return enrollmentRepo.findByClassroomId(classroomId);
    }

    @Transactional
    public void joinClassByCode(String joinCode, User student) {
        Classroom classroom = classroomRepo.findByJoinCode(joinCode)
                .orElseThrow(() -> new RuntimeException("Invalid join code"));

        if (enrollmentRepo.existsByStudentAndClassroom(student, classroom)) {
            throw new RuntimeException("Already enrolled");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .classroom(classroom)
                .joinedAt(LocalDateTime.now())
                .build();

        enrollmentRepo.save(enrollment);
    }

    public List<Classroom> getMyEnrolledClasses(User student) {
        return enrollmentRepo.findByStudent(student).stream()
                .map(Enrollment::getClassroom)
                .toList();
    }
}
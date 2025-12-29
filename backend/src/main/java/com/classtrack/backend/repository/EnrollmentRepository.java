package com.classtrack.backend.repository;

import com.classtrack.backend.entity.User;
import com.classtrack.backend.entity.Enrollment;
import com.classtrack.backend.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByClassroomId(String classroomId);
    List<Enrollment> findByStudent(User student);
    boolean existsByStudentAndClassroom(User student, Classroom classroom);
}
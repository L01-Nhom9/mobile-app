package com.classtrack.backend.repository;

import com.classtrack.backend.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, String> {
    List<Classroom> findByInstructorId(Long instructorId);
    Optional<Classroom> findByJoinCode(String joinCode);
}
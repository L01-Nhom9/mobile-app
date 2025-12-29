package com.classtrack.backend.repository;

import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByClassroomAndStatus(Classroom classroom, LeaveRequest.Status status);
    List<LeaveRequest> findByStudent(User student);
}
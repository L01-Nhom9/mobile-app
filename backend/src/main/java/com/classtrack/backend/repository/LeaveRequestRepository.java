package com.classtrack.backend.repository;

import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByClassroomAndStatus(Classroom classroom, LeaveRequest.Status status);
    List<LeaveRequest> findByStudent(User student);
    List<LeaveRequest> findByClassroom(Classroom classroom);
    List<LeaveRequest> findByClassroomAndStudent(Classroom classroom, User student);

    @Query("SELECT lr.student.id, COUNT(lr.id), " +
           "SUM(CASE WHEN lr.status = 'APPROVED' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN lr.status = 'REJECTED' THEN 1 ELSE 0 END) " +
           "FROM LeaveRequest lr " +
           "WHERE lr.classroom.id = :classId " +
           "AND lr.absenceDate BETWEEN :from AND :to " +
           "GROUP BY lr.student.id")
    List<Object[]> getAttendanceAggregates(@Param("classId") String classId,
                                           @Param("from") LocalDate from,
                                           @Param("to") LocalDate to);

    // Lọc pending theo lớp và tuần (từ startDate đến endDate)
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.classroom.id = :classroomId " +
           "AND lr.status = 'PENDING' " +
           "AND lr.absenceDate BETWEEN :startDate AND :endDate")
    List<LeaveRequest> findPendingByClassAndWeek(@Param("classroomId") String classroomId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);


    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.student.id = :studentId " +
           "AND lr.absenceDate BETWEEN :startDate AND :endDate " +
           "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByStudentWithFilter(@Param("studentId") Long studentId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
}
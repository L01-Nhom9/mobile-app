package com.classtrack.backend.dto;
import com.classtrack.backend.entity.User;

public record StudentInfo(
    Long id,
    String fullName,
    String email
) {
    public static StudentInfo fromEntity(User u) {
        return new StudentInfo(
            u.getId(),
            u.getFullName(),
            u.getEmail()
        );
    }
}
package com.classtrack.backend.dto;

import com.classtrack.backend.entity.Classroom;

public record CreateClassResponse(
        String id,
        String name,
        String description,
        String joinCode
) {
    public static CreateClassResponse fromEntity(Classroom c) {
        return new CreateClassResponse(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getJoinCode()
        );
    }
}

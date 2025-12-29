package com.classtrack.backend.dto;

public record CreateClassRequest(
        String id,
        String name,
        String description
) {}

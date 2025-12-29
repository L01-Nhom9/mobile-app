package com.classtrack.backend.controller;

import com.classtrack.backend.dto.CreateClassRequest;
import com.classtrack.backend.dto.JoinRequest;
import com.classtrack.backend.dto.CreateClassResponse;
import com.classtrack.backend.service.JwtService;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.UserRepository;
import com.classtrack.backend.entity.Classroom;
import com.classtrack.backend.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.List;

import java.security.Principal;

@RestController
@RequestMapping("/api/classroom")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService service;
    private final JwtService jwtService;
    private final UserRepository userRepo;

    @PostMapping("/create")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CreateClassResponse> create(@RequestBody CreateClassRequest req, Principal principal) {
        User instructor = getCurrentUser(principal);
        Classroom classroom = service.createClassroom(req.id(), req.name(), req.description(), instructor);
        CreateClassResponse response = CreateClassResponse.fromEntity(classroom);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-teaching")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CreateClassResponse>> myTeaching(Principal principal) {
        User instructor = getCurrentUser(principal);
        List<Classroom> classes = service.getMyTeachingClasses(instructor);
        List<CreateClassResponse> response = classes.stream()
            .map(CreateClassResponse::fromEntity)
            .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{classId}/students")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> studentsInClass(@PathVariable String classId, Principal principal) {
        User instructor = getCurrentUser(principal);
        return ResponseEntity.ok(service.getStudentsInClass(classId, instructor));
    }

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> join(@RequestBody JoinRequest req, Principal principal) {
        User student = getCurrentUser(principal);
        service.joinClassByCode(req.joinCode(), student);
        return ResponseEntity.ok("Joined successfully");
    }

    @GetMapping("/my-enrolled")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CreateClassResponse>> myEnrolled(Principal principal) {
        User student = getCurrentUser(principal);
        List<Classroom> classes = service.getMyEnrolledClasses(student);
        List<CreateClassResponse> response = classes.stream()
            .map(CreateClassResponse::fromEntity)
            .toList();
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Principal principal) {
        return userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}


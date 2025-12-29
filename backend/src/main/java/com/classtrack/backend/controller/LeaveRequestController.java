package com.classtrack.backend.leaverequest;

import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.dto.LeaveRequestResponse;
import com.classtrack.backend.service.LeaveRequestService;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.UserRepository;
import com.classtrack.backend.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.UrlResource;


import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/leave-request")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService service;
    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRequestRepo;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LeaveRequestResponse> submit(
            @RequestParam String classroomId,
            @RequestParam String absenceDate, // Format: "2025-12-31"
            @RequestParam String reason,
            @RequestParam MultipartFile evidence,
            Principal principal) {

        User student = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate parsedDate = LocalDate.parse(absenceDate);

        LeaveRequest request = service.submitRequest(student, classroomId, parsedDate, reason, evidence);

        return ResponseEntity.ok(LeaveRequestResponse.fromEntity(request));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<LeaveRequestResponse>> myRequests(Principal principal) {
        User student = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<LeaveRequestResponse> response = service.getMyRequests(student)
                .stream()
                .map(LeaveRequestResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{classroomId}/pending")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<LeaveRequestResponse>> pendingRequests(@PathVariable String classroomId, Principal principal) {
        User instructor = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LeaveRequestResponse> response = service.getPendingRequestsForClass(classroomId, instructor)
                .stream()
                .map(LeaveRequestResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/evidence/{id}")
    @PreAuthorize("hasAnyRole('STUDENT','INSTRUCTOR')")
    public ResponseEntity<Resource> viewEvidence(@PathVariable Long id) throws IOException {

        LeaveRequest lr = leaveRequestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        Path path = Paths.get(lr.getEvidenceFilePath());
        Resource resource = new UrlResource(path.toUri());


        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + path.getFileName() + "\""
                )
                .body(resource);
    }


}
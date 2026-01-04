package com.classtrack.backend.controller;

import com.classtrack.backend.entity.LeaveRequest;
import com.classtrack.backend.dto.LeaveRequestResponse;
import com.classtrack.backend.dto.DenyRequest;
import com.classtrack.backend.dto.ApproveResponse;
import com.classtrack.backend.dto.LeaveRequestInfo;
import com.classtrack.backend.dto.DenyResponse;
import com.classtrack.backend.service.LeaveRequestService;
import com.classtrack.backend.entity.User;
import com.classtrack.backend.repository.UserRepository;
import com.classtrack.backend.repository.LeaveRequestRepository;
import com.classtrack.backend.entity.Classroom;
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
import org.springframework.core.io.UrlResource;


import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
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


    @DeleteMapping("/{requestId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long requestId, Principal principal) {
        User student = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        service.deleteLeaveRequest(requestId, student);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<LeaveRequestResponse>> myRequests(
        @RequestParam(required = false) String startDate, // "2025-12-29"
        @RequestParam(required = false) String endDate,   // "2026-01-04"
        Principal principal) {
        User student = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate start = (startDate != null) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null) ? LocalDate.parse(endDate) : null;

        List<LeaveRequestResponse> response = service.getMyRequestsWithFilter(student, start, end)
                .stream()
                .map(LeaveRequestResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LeaveRequestInfo> getRequestDetail(@PathVariable Long requestId, Principal principal) {
        User student = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeaveRequest request = leaveRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getStudent().equals(student)) {
            throw new RuntimeException("Not your request");
        }

        return ResponseEntity.ok(LeaveRequestInfo.fromEntity(request));
    }

    @GetMapping("/{classroomId}/pending")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<LeaveRequestResponse>> pendingRequests(@PathVariable String classroomId,
        @RequestParam(required = false) String startDate, // "2025-12-29"
        @RequestParam(required = false) String endDate,   // "2026-01-04"
        Principal principal) {
        User instructor = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate start = (startDate != null) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null) ? LocalDate.parse(endDate) : null;

        List<LeaveRequestResponse> response = service.getPendingRequestsForClass(classroomId, start, end, instructor)
                .stream()
                .map(LeaveRequestResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/instructor/{studentRequestId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LeaveRequestInfo> getRequestDetailForInstructor(
            @PathVariable Long studentRequestId,
            Principal principal
    ) {
        User instructor = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeaveRequest request = leaveRequestRepo.findById(studentRequestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Classroom classroom = request.getClassroom();

        if (!classroom.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("You are not allowed to view this request");
        }

        return ResponseEntity.ok(LeaveRequestInfo.fromEntity(request));
    }



    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApproveResponse> approve(@PathVariable Long requestId, Principal principal) {
        User instructor = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApproveResponse.fromEntity(service.approveRequest(requestId, instructor)));
    }

    @PostMapping("/{requestId}/deny")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<DenyResponse> deny(@PathVariable Long requestId,
                                             @RequestBody DenyRequest denyReq,
                                             Principal principal) {
        User instructor = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(DenyResponse.fromEntity(service.denyRequest(requestId, denyReq.denialReason(), instructor)));
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
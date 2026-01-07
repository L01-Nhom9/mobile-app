package com.classtrack.backend.controller;

import com.classtrack.backend.dto.auth.AuthenticationRequest;
import com.classtrack.backend.dto.auth.AuthenticationResponse;
import com.classtrack.backend.dto.auth.RegisterRequest;
import com.classtrack.backend.entity.Role;
import com.classtrack.backend.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationService authService;

    @Test
    void register_Student_Success() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "student@test.com",
                "password123",
                "John Doe",
                Role.STUDENT
        );

        AuthenticationResponse response = new AuthenticationResponse("mock-jwt-token", "mock-refresh-token");

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-jwt-token"));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void register_Instructor_Success() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "instructor@test.com",
                "password123",
                "Jane Smith",
                Role.INSTRUCTOR
        );

        AuthenticationResponse response = new AuthenticationResponse("mock-jwt-token-instructor", "mock-refresh-token");

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-jwt-token-instructor"));
    }

    @Test
    void login_ValidCredentials_Success() throws Exception {
        AuthenticationRequest request = new AuthenticationRequest(
                "student@test.com",
                "password123"
        );

        AuthenticationResponse response = new AuthenticationResponse("login-jwt-token", "mock-refresh-token");

        when(authService.authenticate(any(AuthenticationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("login-jwt-token"));

        verify(authService).authenticate(any(AuthenticationRequest.class));
    }

    @Test
    void login_InvalidCredentials_ThrowsException() throws Exception {
        AuthenticationRequest request = new AuthenticationRequest(
                "student@test.com",
                "wrongpassword"
        );

        when(authService.authenticate(any(AuthenticationRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_DuplicateEmail_ThrowsException() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "existing@test.com",
                "password123",
                "John Doe",
                Role.STUDENT
        );

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email already exists"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_InvalidJson_BadRequest() throws Exception {
        String invalidJson = "{invalid json}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());

        verify(authService, never()).register(any());
    }

    @Test
    void login_InvalidJson_BadRequest() throws Exception {
        String invalidJson = "{invalid json}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());

        verify(authService, never()).authenticate(any());
    }
}
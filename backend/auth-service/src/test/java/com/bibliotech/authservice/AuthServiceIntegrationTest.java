package com.bibliotech.authservice;

import com.bibliotech.authservice.dto.AuthResponse;
import com.bibliotech.authservice.dto.LoginRequest;
import com.bibliotech.authservice.dto.RegisterRequest;
import com.bibliotech.authservice.model.Role;
import com.bibliotech.authservice.repository.UserRepository;
import com.bibliotech.authservice.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("19, 20: Registration, JWT login, and token validation")
    void testRegistrationAndLogin() throws Exception {
        // 1. Register student
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("dhanya_student");
        registerRequest.setPassword("securePass123");
        registerRequest.setRole(Role.STUDENT);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // 2. Duplicate registration fails (400)
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());

        // 3. Login with invalid password -> 401 Unauthorized
        LoginRequest invalidLogin = new LoginRequest();
        invalidLogin.setUsername("dhanya_student");
        invalidLogin.setPassword("wrongPassword");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized());

        // 4. Valid login -> receives JWT token
        LoginRequest validLogin = new LoginRequest();
        validLogin.setUsername("dhanya_student");
        validLogin.setPassword("securePass123");

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                AuthResponse.class
        );

        assertNotNull(authResponse.getToken());

        // 5. Parse and validate claims
        // Need verification using secret key
        javax.crypto.SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                "bibliotechSuperSecretKeyForJWT2026ChangeThisBeforeSubmission".getBytes()
        );
        Claims claims = io.jsonwebtoken.Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(authResponse.getToken())
                .getBody();

        assertEquals("dhanya_student", claims.getSubject());
        assertEquals("STUDENT", claims.get("role", String.class));
    }
}

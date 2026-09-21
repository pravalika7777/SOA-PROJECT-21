package com.bibliotech.fineservice;

import com.bibliotech.fineservice.dto.FineCalculateRequest;
import com.bibliotech.fineservice.model.Fine;
import com.bibliotech.fineservice.model.FineStatus;
import com.bibliotech.fineservice.repository.FineRepository;
import com.bibliotech.fineservice.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FineServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String studentToken;
    private String librarianToken;

    @BeforeEach
    void setUp() {
        fineRepository.deleteAll();
        studentToken = "Bearer " + jwtUtil.generateToken("student_dhanya", "STUDENT");
        librarianToken = "Bearer " + jwtUtil.generateToken("admin_librarian", "LIBRARIAN");
    }

    @Test
    void testCalculateFine_OnTime_ReturnsNoFine() throws Exception {
        FineCalculateRequest req = new FineCalculateRequest();
        req.setRentalId(101L);
        req.setIssueDate(LocalDate.of(2026, 9, 1));
        req.setReturnDate(LocalDate.of(2026, 9, 10)); // 9 days <= 14 days

        mockMvc.perform(post("/fines/calculate")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("No fine")));

        assertEquals(0, fineRepository.count());
    }

    @Test
    void testCalculateFine_Overdue_CalculatesCorrectFine() throws Exception {
        FineCalculateRequest req = new FineCalculateRequest();
        req.setRentalId(102L);
        req.setIssueDate(LocalDate.of(2026, 9, 1));
        req.setReturnDate(LocalDate.of(2026, 9, 20)); // 19 days => 5 overdue days * 5.0 = 25.0

        String responseJson = mockMvc.perform(post("/fines/calculate")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Fine fine = objectMapper.readValue(responseJson, Fine.class);
        assertNotNull(fine.getFineId());
        assertEquals(102L, fine.getRentalId());
        assertEquals(25.0, fine.getAmount());
        assertEquals(FineStatus.PENDING, fine.getStatus());
    }

    @Test
    void testPayFine_RoleEnforcement() throws Exception {
        // Create an overdue fine first
        Fine fine = new Fine(103L, 25.0, FineStatus.PENDING);
        fine = fineRepository.save(fine);

        // Student tries to pay -> 403 Forbidden
        mockMvc.perform(put("/fines/" + fine.getFineId() + "/pay")
                .header("Authorization", studentToken))
                .andExpect(status().isForbidden());

        // Librarian pays -> 200 OK and status is PAID
        mockMvc.perform(put("/fines/" + fine.getFineId() + "/pay")
                .header("Authorization", librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        Fine updated = fineRepository.findById(fine.getFineId()).orElseThrow();
        assertEquals(FineStatus.PAID, updated.getStatus());
    }

    @Test
    void testUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/fines/1"))
                .andExpect(status().isUnauthorized());
    }
}

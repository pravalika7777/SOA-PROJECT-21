package com.klu;

import com.klu.dto.OverdueLoanResponse;
import com.klu.entity.Loan;
import com.klu.repository.LoanRepository;
import com.klu.service.LoanNotificationService;
import com.klu.service.LoanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class LoanServiceIntegrationTest {

    @TestConfiguration
    static class TestRestTemplateConfig {
        @Bean
        public RestTemplate restTemplate() {
            return new RestTemplate();
        }
    }

    @Autowired
    private LoanService loanService;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private LoanNotificationService notificationService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private MockMvc mockMvc;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        loanRepository.deleteAll();
        mockServer = MockRestServiceServer.bindTo(restTemplate).ignoreExpectOrder(true).build();
    }

    private String createToken(String username, String role) {
        java.util.Date now = new java.util.Date();
        java.util.Date expiry = new java.util.Date(now.getTime() + 3600000);
        javax.crypto.SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                "bibliotechSuperSecretKeyForJWT2026ChangeThisBeforeSubmission".getBytes()
        );
        return "Bearer " + io.jsonwebtoken.Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    @DisplayName("4, 9, 10, 11: Borrow book, dates population, and duplicate borrowing prevention")
    void testBorrowAndDuplicateBorrowing() {
        // Expect 2 calls to BOOKSERVICE (first for user1, second for user2)
        mockServer.expect(org.springframework.test.web.client.ExpectedCount.twice(), requestTo("http://BOOKSERVICE/books/101/borrow"))
                .andExpect(method(HttpMethod.PUT))
                .andRespond(withSuccess());

        // 1. User 1 borrows Book 101
        Loan loan1 = new Loan();
        loan1.setUserId(1L);
        loan1.setBookId(101L);

        Loan created = loanService.createLoan(loan1);
        assertNotNull(created.getLoanId());
        assertEquals(LocalDate.now(), created.getIssueDate());
        assertNull(created.getReturnDate());
        assertEquals("BORROWED", created.getStatus());

        // 2. User 1 attempts duplicate borrow for same book while active -> 409 Conflict
        Loan duplicateLoan = new Loan();
        duplicateLoan.setUserId(1L);
        duplicateLoan.setBookId(101L);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> loanService.createLoan(duplicateLoan)
        );
        assertEquals(409, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("active loan"));

        // 3. Different user (User 2) borrows Book 101 -> allowed
        Loan user2Loan = new Loan();
        user2Loan.setUserId(2L);
        user2Loan.setBookId(101L);

        Loan createdUser2 = loanService.createLoan(user2Loan);
        assertNotNull(createdUser2.getLoanId());
        assertEquals("BORROWED", createdUser2.getStatus());
        mockServer.verify();
    }

    @Test
    @DisplayName("12-16: Complete return lifecycle (Loan -> Fine -> Book) and prevent double return")
    void testReturnLifecycle() {
        mockServer.expect(requestTo("http://BOOKSERVICE/books/102/borrow"))
                .andExpect(method(HttpMethod.PUT))
                .andRespond(withSuccess());

        mockServer.expect(requestTo("http://FINE-SERVICE/fines/calculate"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("No fine: book returned on time", MediaType.TEXT_PLAIN));

        mockServer.expect(requestTo("http://BOOKSERVICE/books/102/return"))
                .andExpect(method(HttpMethod.PUT))
                .andRespond(withSuccess());

        // Create active loan
        Loan loan = new Loan();
        loan.setUserId(1L);
        loan.setBookId(102L);
        Loan created = loanService.createLoan(loan);

        // Return book
        Loan returned = loanService.returnBook(created.getLoanId());
        assertEquals("RETURNED", returned.getStatus());
        assertEquals(LocalDate.now(), returned.getReturnDate());

        // Attempting to return the same loan again -> 409 Conflict
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> loanService.returnBook(created.getLoanId())
        );
        assertEquals(409, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("already returned"));
    }

    @Test
    @DisplayName("14-15: Overdue tracking and notification mechanism")
    void testOverdueTrackingAndNotification() {
        // Create an overdue loan manually (issued 20 days ago)
        Loan overdueLoan = new Loan();
        overdueLoan.setUserId(5L);
        overdueLoan.setBookId(205L);
        overdueLoan.setIssueDate(LocalDate.now().minusDays(20));
        overdueLoan.setStatus("BORROWED");
        loanRepository.save(overdueLoan);

        // Verify overdue calculation (20 - 14 = 6 days overdue)
        List<OverdueLoanResponse> overdueList = loanService.getOverdueLoans();
        assertFalse(overdueList.isEmpty());
        OverdueLoanResponse first = overdueList.get(0);
        assertEquals(5L, first.getUserId());
        assertEquals(205L, first.getBookId());
        assertEquals(6, first.getDaysOverdue());

        // Verify notification mechanism
        List<String> notifications = notificationService.sendOverdueNotifications();
        assertFalse(notifications.isEmpty());
        assertTrue(notifications.get(0).contains("OVERDUE NOTIFICATION: User 5 has overdue Book 205 by 6 days"));
    }

    @Test
    @DisplayName("Security: Role-based authorization for loans")
    void testSecurityRoles() throws Exception {
        String studentJwt = createToken("student1", "STUDENT");
        String librarianJwt = createToken("admin1", "LIBRARIAN");

        // Student cannot view all loans -> 403 Forbidden
        mockMvc.perform(get("/loans")
                .header("Authorization", studentJwt))
                .andExpect(status().isForbidden());

        // Librarian can view all loans -> 200 OK
        mockMvc.perform(get("/loans")
                .header("Authorization", librarianJwt))
                .andExpect(status().isOk());

        // Missing token -> 401 Unauthorized
        mockMvc.perform(get("/loans"))
                .andExpect(status().isUnauthorized());
    }
}

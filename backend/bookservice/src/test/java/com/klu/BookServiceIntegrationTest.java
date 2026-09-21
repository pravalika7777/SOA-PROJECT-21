package com.klu;

import com.klu.entity.Book;
import com.klu.exception.BookNotAvailableException;
import com.klu.repository.BookRepository;
import com.klu.security.JwtUtil;
import com.klu.service.BookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class BookServiceIntegrationTest {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MockMvc mockMvc;

    private Long sampleBookId;
    private String studentToken;
    private String librarianToken;

    @BeforeEach
    void setUp() {
        bookRepository.deleteAll();
        Book book = new Book(null, "Clean Architecture", "Robert C. Martin", 2);
        Book saved = bookRepository.save(book);
        sampleBookId = saved.getBookId();

        studentToken = createToken("student1", "STUDENT");
        librarianToken = createToken("admin1", "LIBRARIAN");
    }

    private String createToken(String username, String role) {
        // Build valid token using the service's key
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
    @DisplayName("1-5. Book inventory decreases on borrow and availability reflects copies")
    void testBorrowAndAvailability() {
        assertTrue(bookService.checkAvailability(sampleBookId));

        Book borrowed = bookService.borrowBook(sampleBookId);
        assertEquals(1, borrowed.getAvailableCopies());

        Book secondBorrow = bookService.borrowBook(sampleBookId);
        assertEquals(0, secondBorrow.getAvailableCopies());
        assertFalse(bookService.checkAvailability(sampleBookId));

        // 6-8. Attempt borrow with zero copies -> 409 Conflict exception
        assertThrows(BookNotAvailableException.class, () -> bookService.borrowBook(sampleBookId));
    }

    @Test
    @DisplayName("12-13. Book return increases available copies")
    void testReturnBook() {
        bookService.borrowBook(sampleBookId); // copies: 1
        Book returned = bookService.returnBook(sampleBookId); // copies: 2
        assertEquals(2, returned.getAvailableCopies());
    }

    @Test
    @DisplayName("Security: Public catalog browsing allows unauthenticated GET")
    void testPublicBrowsing() throws Exception {
        mockMvc.perform(get("/books"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/books/" + sampleBookId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Clean Architecture"));
    }

    @Test
    @DisplayName("21-22. Role authorization: Student cannot add books (403), Librarian can (200)")
    void testRoleAuthorization() throws Exception {
        String studentJwt = createToken("student1", "STUDENT");
        String librarianJwt = createToken("admin1", "LIBRARIAN");

        // Missing JWT -> 401 Unauthorized
        mockMvc.perform(post("/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Domain-Driven Design\",\"author\":\"Eric Evans\",\"availableCopies\":3}"))
                .andExpect(status().isUnauthorized());

        // Student attempting Librarian operation -> 403 Forbidden
        mockMvc.perform(post("/books")
                .header("Authorization", studentJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Domain-Driven Design\",\"author\":\"Eric Evans\",\"availableCopies\":3}"))
                .andExpect(status().isForbidden());

        // Librarian adding book -> 200 OK
        mockMvc.perform(post("/books")
                .header("Authorization", librarianJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Domain-Driven Design\",\"author\":\"Eric Evans\",\"availableCopies\":3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookId").exists());
    }
}

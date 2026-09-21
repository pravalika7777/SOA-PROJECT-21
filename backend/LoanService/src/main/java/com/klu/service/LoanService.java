package com.klu.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.klu.dto.FineCalculateRequest;
import com.klu.dto.OverdueLoanResponse;
import com.klu.entity.Loan;
import com.klu.repository.LoanRepository;

@Service
public class LoanService {

    private final LoanRepository repository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${fine.loan-period-days:14}")
    private int loanPeriodDays;

    public LoanService(
            LoanRepository repository,
            RestTemplate restTemplate) {

        this.repository = repository;
        this.restTemplate = restTemplate;
    }

    // ==========================================
    // CREATE LOAN / BORROW BOOK
    // ==========================================

    public Loan createLoan(Loan loan) {

        // 1. Prevent duplicate active borrowing for the same user and book
        if (repository.existsByUserIdAndBookIdAndStatus(loan.getUserId(), loan.getBookId(), "BORROWED")) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User already has an active loan for this book"
            );
        }

        // 2. Call Book Service via Eureka LoadBalancer to decrement available copies
        String bookUrl = "http://BOOKSERVICE/books/"
                + loan.getBookId()
                + "/borrow";

        try {
            restTemplate.put(bookUrl, null);
        } catch (HttpClientErrorException.Conflict ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No copies available"
            );
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Book not found"
            );
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Book Service unavailable: " + ex.getMessage()
            );
        }

        // 3. Set loan dates and initial status
        loan.setIssueDate(LocalDate.now());
        loan.setReturnDate(null);
        loan.setStatus("BORROWED");
        loan.setFineAmount(null);

        return repository.save(loan);
    }

    // ==========================================
    // GET ALL LOANS
    // ==========================================

    public List<Loan> getAllLoans() {
        return repository.findAll();
    }

    // ==========================================
    // GET LOAN BY ID
    // ==========================================

    public Loan getLoanById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Loan not found"
                    )
                );
    }

    // ==========================================
    // GET LOANS BY USER
    // ==========================================

    public List<Loan> getLoansByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    // ==========================================
    // GET LOANS BY BOOK
    // ==========================================

    public List<Loan> getLoansByBook(Long bookId) {
        return repository.findByBookId(bookId);
    }

    // ==========================================
    // RETURN BOOK (LOAN -> FINE -> BOOK FLOW)
    // ==========================================

    public Loan returnBook(Long id) {

        Loan loan = getLoanById(id);

        // Check if already returned
        if ("RETURNED".equalsIgnoreCase(loan.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Book already returned"
            );
        }

        LocalDate returnDate = LocalDate.now();

        // Step A: Calculate fine via Fine Service (Inter-service call)
        Double fineAmount = 0.0;
        try {
            FineCalculateRequest fineRequest = new FineCalculateRequest(
                    loan.getLoanId(),
                    loan.getIssueDate() != null ? loan.getIssueDate() : returnDate,
                    returnDate
            );

            ResponseEntity<String> fineResponse = restTemplate.postForEntity(
                    "http://FINE-SERVICE/fines/calculate",
                    fineRequest,
                    String.class
            );

            if (fineResponse.getBody() != null) {
                String body = fineResponse.getBody();
                if (body.contains("\"amount\"")) {
                    JsonNode node = objectMapper.readTree(body);
                    if (node.has("amount")) {
                        fineAmount = node.get("amount").asDouble(0.0);
                    }
                }
            }
        } catch (Exception ex) {
            // Do not fail return if fine service is momentarily offline; record 0.0 or log
            fineAmount = 0.0;
        }

        // Step B: Tell Book Service to increment available copies
        String bookUrl = "http://BOOKSERVICE/books/"
                + loan.getBookId()
                + "/return";

        try {
            restTemplate.put(bookUrl, null);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Book not found"
            );
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Book Service unavailable: " + ex.getMessage()
            );
        }

        // Step C: Update loan status and return date
        loan.setReturnDate(returnDate);
        loan.setStatus("RETURNED");
        loan.setFineAmount(fineAmount);

        return repository.save(loan);
    }

    // ==========================================
    // OVERDUE TRACKING
    // ==========================================

    public List<OverdueLoanResponse> getOverdueLoans() {
        List<Loan> activeLoans = repository.findByStatus("BORROWED");
        List<OverdueLoanResponse> overdueList = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Loan loan : activeLoans) {
            if (loan.getIssueDate() != null) {
                LocalDate dueDate = loan.getIssueDate().plusDays(loanPeriodDays);
                if (today.isAfter(dueDate)) {
                    long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);
                    overdueList.add(new OverdueLoanResponse(
                            loan.getLoanId(),
                            loan.getUserId(),
                            loan.getBookId(),
                            loan.getIssueDate(),
                            dueDate,
                            daysOverdue
                    ));
                }
            }
        }

        return overdueList;
    }

    // ==========================================
    // DELETE LOAN
    // ==========================================

    public void deleteLoan(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Loan not found"
            );
        }
        repository.deleteById(id);
    }
}
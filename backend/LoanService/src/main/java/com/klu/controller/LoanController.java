package com.klu.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klu.dto.OverdueLoanResponse;
import com.klu.entity.Loan;
import com.klu.service.LoanNotificationService;
import com.klu.service.LoanService;

@RestController
@RequestMapping("/loans")
public class LoanController {

    private final LoanService service;
    private final LoanNotificationService notificationService;

    public LoanController(LoanService service, LoanNotificationService notificationService) {
        this.service = service;
        this.notificationService = notificationService;
    }

    // ==========================================
    // CREATE LOAN / BORROW BOOK
    // ==========================================

    @PostMapping
    public Loan createLoan(@RequestBody Loan loan) {
        return service.createLoan(loan);
    }

    // ==========================================
    // GET ALL LOANS
    // ==========================================

    @GetMapping
    public List<Loan> getAllLoans() {
        return service.getAllLoans();
    }

    // ==========================================
    // OVERDUE TRACKING (Must come before /{id})
    // ==========================================

    @GetMapping("/overdue")
    public List<OverdueLoanResponse> getOverdueLoans() {
        return service.getOverdueLoans();
    }

    // ==========================================
    // TRIGGER OVERDUE NOTIFICATIONS
    // ==========================================

    @PostMapping("/overdue/notify")
    public ResponseEntity<List<String>> triggerOverdueNotifications() {
        List<String> notifications = notificationService.sendOverdueNotifications();
        return ResponseEntity.ok(notifications);
    }

    // ==========================================
    // GET LOAN BY ID
    // ==========================================

    @GetMapping("/{id}")
    public Loan getLoanById(@PathVariable Long id) {
        return service.getLoanById(id);
    }

    // ==========================================
    // GET LOANS BY USER
    // ==========================================

    @GetMapping("/user/{userId}")
    public List<Loan> getLoansByUser(@PathVariable Long userId) {
        return service.getLoansByUser(userId);
    }

    // ==========================================
    // GET LOANS BY BOOK
    // ==========================================

    @GetMapping("/book/{bookId}")
    public List<Loan> getLoansByBook(@PathVariable Long bookId) {
        return service.getLoansByBook(bookId);
    }

    // ==========================================
    // RETURN BOOK
    // ==========================================

    @PutMapping("/{id}/return")
    public Loan returnBook(@PathVariable Long id) {
        return service.returnBook(id);
    }

    // ==========================================
    // DELETE LOAN
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLoan(@PathVariable Long id) {
        service.deleteLoan(id);
        return ResponseEntity.ok("Loan deleted successfully");
    }
}
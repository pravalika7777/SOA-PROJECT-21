package com.bibliotech.fineservice.controller;

import com.bibliotech.fineservice.dto.FineCalculateRequest;
import com.bibliotech.fineservice.model.Fine;
import com.bibliotech.fineservice.model.FineStatus;
import com.bibliotech.fineservice.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/fines")
public class FineController {

    @Autowired
    private FineRepository fineRepository;

    // Loan period and daily rate: agree these numbers with your team.
    @Value("${fine.loan-period-days:14}")
    private int loanPeriodDays;

    @Value("${fine.rate-per-day:5.0}")
    private double ratePerDay;

    // Called by Rental Service (Dhanya) whenever a book is returned.
    // If it's on time, no fine is created and amount 0 is returned.
    @PostMapping("/calculate")
    public ResponseEntity<?> calculateFine(@RequestBody FineCalculateRequest request) {
        long daysBorrowed = ChronoUnit.DAYS.between(request.getIssueDate(), request.getReturnDate());
        long overdueDays = Math.max(0, daysBorrowed - loanPeriodDays);

        if (overdueDays == 0) {
            return ResponseEntity.ok().body("No fine: book returned on time");
        }

        double amount = overdueDays * ratePerDay;
        Fine fine = new Fine(request.getRentalId(), amount, FineStatus.PENDING);
        Fine saved = fineRepository.save(fine);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Fine>> getAllFines() {
        return ResponseEntity.ok(fineRepository.findAll());
    }

    @GetMapping("/{fineId}")
    public ResponseEntity<Fine> getFine(@PathVariable Long fineId) {
        return fineRepository.findById(fineId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rental/{rentalId}")
    public ResponseEntity<List<Fine>> getFinesByRental(@PathVariable Long rentalId) {
        return ResponseEntity.ok(fineRepository.findByRentalId(rentalId));
    }

    // Librarian-only (enforced in SecurityConfig): mark a fine as settled.
    @PutMapping("/{fineId}/pay")
    public ResponseEntity<?> payFine(@PathVariable Long fineId) {
        return fineRepository.findById(fineId)
                .map(fine -> {
                    fine.setStatus(FineStatus.PAID);
                    fineRepository.save(fine);
                    return ResponseEntity.ok(fine);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

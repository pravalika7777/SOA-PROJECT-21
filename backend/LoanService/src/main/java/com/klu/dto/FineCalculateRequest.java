package com.klu.dto;

import java.time.LocalDate;

public class FineCalculateRequest {
    private Long rentalId;
    private LocalDate issueDate;
    private LocalDate returnDate;

    public FineCalculateRequest() {}

    public FineCalculateRequest(Long rentalId, LocalDate issueDate, LocalDate returnDate) {
        this.rentalId = rentalId;
        this.issueDate = issueDate;
        this.returnDate = returnDate;
    }

    public Long getRentalId() { return rentalId; }
    public void setRentalId(Long rentalId) { this.rentalId = rentalId; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
}

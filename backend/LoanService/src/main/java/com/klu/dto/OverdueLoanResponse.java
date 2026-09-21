package com.klu.dto;

import java.time.LocalDate;

public class OverdueLoanResponse {

    private Long loanId;
    private Long userId;
    private Long bookId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private long daysOverdue;

    public OverdueLoanResponse() {
    }

    public OverdueLoanResponse(Long loanId, Long userId, Long bookId, LocalDate issueDate, LocalDate dueDate, long daysOverdue) {
        this.loanId = loanId;
        this.userId = userId;
        this.bookId = bookId;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.daysOverdue = daysOverdue;
    }

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public long getDaysOverdue() {
        return daysOverdue;
    }

    public void setDaysOverdue(long daysOverdue) {
        this.daysOverdue = daysOverdue;
    }
}

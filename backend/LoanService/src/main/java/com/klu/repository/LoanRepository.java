package com.klu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.entity.Loan;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserId(Long userId);

    List<Loan> findByBookId(Long bookId);

    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    List<Loan> findByStatus(String status);

    List<Loan> findByUserIdAndStatus(Long userId, String status);
}
package com.bibliotech.fineservice.repository;

import com.bibliotech.fineservice.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByRentalId(Long rentalId);
}

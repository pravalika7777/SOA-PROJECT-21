package com.bibliotech.fineservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fine")
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fineId;

    private Long rentalId;

    private Double amount;

    @Enumerated(EnumType.STRING)
    private FineStatus status;

    public Fine() {}

    public Fine(Long rentalId, Double amount, FineStatus status) {
        this.rentalId = rentalId;
        this.amount = amount;
        this.status = status;
    }

    public Long getFineId() { return fineId; }
    public void setFineId(Long fineId) { this.fineId = fineId; }

    public Long getRentalId() { return rentalId; }
    public void setRentalId(Long rentalId) { this.rentalId = rentalId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public FineStatus getStatus() { return status; }
    public void setStatus(FineStatus status) { this.status = status; }
}

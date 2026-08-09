package com.sems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "logistics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Logistics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    private String itemName;

    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private BigDecimal quantity;

    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogisticsStatus status = LogisticsStatus.PENDING;

    private LocalDate expectedDate;

    private LocalDate actualDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum LogisticsStatus {
        PENDING, IN_TRANSIT, DELIVERED
    }
}

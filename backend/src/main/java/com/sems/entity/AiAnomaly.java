package com.sems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_anomalies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiAnomaly {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnomalyType anomalyType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnomalySeverity severity = AnomalySeverity.MEDIUM;

    @CreationTimestamp
    @Column(name = "detected_at", updatable = false)
    private LocalDateTime detectedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnomalyStatus status = AnomalyStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum AnomalyType {
        INVENTORY, SALES, BILLING, STOCK_UPDATE
    }

    public enum AnomalySeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum AnomalyStatus {
        OPEN, REVIEWED, RESOLVED
    }
}

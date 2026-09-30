package be.tectonic.subscription;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class ApiModels {
    private ApiModels() {
    }

    public enum SubscriptionStatus {
        HERKEND, BEVESTIGD, GEANNULEERD, GEANNEGEERD
    }

    public record Transaction(
            String merchant,
            BigDecimal amount,
            LocalDate date) {
    }

    public record Subscription(
            long id,
            String name,
            String category,
            BigDecimal amount,
            String frequency,
            LocalDate nextDate,
            BigDecimal confidence,
            String reason,
            SubscriptionStatus status) {
    }

    public record OverlapAlert(
            String category,
            List<String> subscriptions,
            BigDecimal possibleMonthlySaving,
            String message) {
    }

    public record PreDebitAlert(
            String subscription,
            BigDecimal amount,
            LocalDate date,
            long daysUntilDebit,
            String message) {
    }

    public record Reserve(
            boolean enabled,
            BigDecimal monthlyTarget,
            BigDecimal monthlyRequired,
            BigDecimal remainingBuffer) {
    }

    public record Dashboard(
            List<Subscription> subscriptions,
            List<Transaction> transactions,
            BigDecimal monthlyTotal,
            BigDecimal annualTotal,
            List<Subscription> upcomingDebits,
            List<OverlapAlert> overlaps,
            List<PreDebitAlert> alerts,
            Reserve reserve) {
    }

    public record StatusRequest(@NotNull SubscriptionStatus status) {
    }

    public record ReserveRequest(
            boolean enabled,
            @NotNull @DecimalMin(value = "0.00") BigDecimal monthlyTarget) {
    }
}

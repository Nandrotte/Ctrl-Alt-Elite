package be.tectonic.subscription;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class SubscriptionServiceTest {
    private final SubscriptionService service = new SubscriptionService();

    @Test
    void detectsRecurringPaymentsAndExcludesOneOffPayments() {
        var dashboard = service.dashboard();

        assertThat(dashboard.subscriptions()).hasSize(5);
        assertThat(dashboard.subscriptions()).extracting(ApiModels.Subscription::name)
                .containsExactlyInAnyOrder("Netflix", "Disney+", "Spotify", "Adobe Creative Cloud", "Basic-Fit");
        assertThat(dashboard.transactions()).extracting(ApiModels.Transaction::merchant).contains("Coolblue");
        assertThat(dashboard.overlaps()).extracting(ApiModels.OverlapAlert::category).containsExactly("Streaming");
    }

    @Test
    void updatesReserveAndStatusInMemory() {
        var reserve = service.updateReserve(true, new BigDecimal("120.00"));
        assertThat(reserve.monthlyTarget()).isEqualByComparingTo("120.00");
        assertThat(reserve.remainingBuffer()).isEqualByComparingTo("25.05");

        service.updateStatus(1, ApiModels.SubscriptionStatus.GEANNEGEERD);
        assertThat(service.dashboard().subscriptions()).hasSize(4);
    }
}

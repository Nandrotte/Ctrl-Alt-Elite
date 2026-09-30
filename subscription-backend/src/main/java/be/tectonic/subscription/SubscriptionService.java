package be.tectonic.subscription;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import static be.tectonic.subscription.ApiModels.*;

@Service
public class SubscriptionService {
    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    private static final Map<String, Profile> PROFILES = Map.of(
            "Netflix", new Profile("Streaming"),
            "Disney+", new Profile("Streaming"),
            "Spotify", new Profile("Muziek"),
            "Adobe Creative Cloud", new Profile("Software"),
            "Basic-Fit", new Profile("Sport"));

    private final Clock clock = Clock.systemUTC();
    private final List<Transaction> transactions = List.of(
            tx("Netflix", "17.99", "2026-07-02"), tx("Netflix", "17.99", "2026-08-02"),
            tx("Netflix", "17.99", "2026-09-02"),
            tx("Disney+", "10.99", "2026-07-09"), tx("Disney+", "10.99", "2026-08-09"),
            tx("Disney+", "10.99", "2026-09-09"),
            tx("Spotify", "10.99", "2026-07-12"), tx("Spotify", "10.99", "2026-08-12"),
            tx("Spotify", "10.99", "2026-09-12"),
            tx("Adobe Creative Cloud", "24.99", "2026-07-18"), tx("Adobe Creative Cloud", "24.99", "2026-08-18"),
            tx("Adobe Creative Cloud", "24.99", "2026-09-18"),
            tx("Basic-Fit", "29.99", "2026-07-24"), tx("Basic-Fit", "29.99", "2026-08-24"),
            tx("Basic-Fit", "29.99", "2026-09-24"),
            tx("Coolblue", "249.00", "2026-09-16"));
    private final Map<Long, SubscriptionStatus> statuses = new ConcurrentHashMap<>();
    private final AtomicReference<BigDecimal> reserveTarget = new AtomicReference<>(new BigDecimal("93.95"));
    private final AtomicReference<Boolean> reserveEnabled = new AtomicReference<>(true);

    public Dashboard dashboard() {
        List<Subscription> subscriptions = detectSubscriptions().stream()
                .map(subscription -> withStatus(subscription,
                        statuses.getOrDefault(subscription.id(), subscription.status())))
                .filter(subscription -> subscription.status() != SubscriptionStatus.GEANNEGEERD)
                .sorted(Comparator.comparing(Subscription::nextDate))
                .toList();
        BigDecimal monthlyTotal = total(subscriptions);
        return new Dashboard(
                subscriptions,
                transactions,
                monthlyTotal,
                monthlyTotal.multiply(BigDecimal.valueOf(12)).setScale(2, RoundingMode.HALF_UP),
                subscriptions,
                findOverlaps(subscriptions),
                findPreDebitAlerts(subscriptions),
                reserve(monthlyTotal));
    }

    public List<Transaction> transactions() {
        return transactions;
    }

    public List<Subscription> subscriptions() {
        return dashboard().subscriptions();
    }

    public Subscription updateStatus(long id, SubscriptionStatus status) {
        Subscription subscription = detectSubscriptions().stream()
                .filter(candidate -> candidate.id() == id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        statuses.put(id, status);
        return withStatus(subscription, status);
    }

    public Reserve updateReserve(boolean enabled, BigDecimal monthlyTarget) {
        reserveEnabled.set(enabled);
        reserveTarget.set(monthlyTarget.setScale(2, RoundingMode.HALF_UP));
        return reserve(total(dashboard().subscriptions()));
    }

    private List<Subscription> detectSubscriptions() {
        Map<String, List<Transaction>> grouped = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::merchant, LinkedHashMap::new, Collectors.toList()));
        List<Subscription> detected = new ArrayList<>();
        long id = 1;
        for (Map.Entry<String, List<Transaction>> entry : grouped.entrySet()) {
            List<Transaction> payments = entry.getValue().stream().sorted(Comparator.comparing(Transaction::date))
                    .toList();
            if (payments.size() < 3 || !PROFILES.containsKey(entry.getKey())) {
                continue;
            }
            List<Long> intervals = new ArrayList<>();
            for (int index = 1; index < payments.size(); index++) {
                intervals.add(ChronoUnit.DAYS.between(payments.get(index - 1).date(), payments.get(index).date()));
            }
            BigDecimal average = payments.stream().map(Transaction::amount).reduce(ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(payments.size()), 2, RoundingMode.HALF_UP);
            BigDecimal minimum = payments.stream().map(Transaction::amount).min(Comparator.naturalOrder()).orElse(ZERO);
            BigDecimal maximum = payments.stream().map(Transaction::amount).max(Comparator.naturalOrder()).orElse(ZERO);
            BigDecimal variation = maximum.subtract(minimum).divide(average, 4, RoundingMode.HALF_UP);
            boolean monthly = intervals.stream().allMatch(interval -> interval >= 25 && interval <= 35);
            if (!monthly || variation.compareTo(new BigDecimal("0.10")) > 0) {
                continue;
            }
            long averageInterval = Math.round(intervals.stream().mapToLong(Long::longValue).average().orElse(30));
            detected.add(new Subscription(
                    id++, entry.getKey(), PROFILES.get(entry.getKey()).category(), average,
                    "Maandelijks", payments.get(payments.size() - 1).date().plusDays(averageInterval),
                    new BigDecimal("0.98"), payments.size() + " gelijke maandelijkse betalingen",
                    SubscriptionStatus.HERKEND));
        }
        return detected;
    }

    private List<OverlapAlert> findOverlaps(List<Subscription> subscriptions) {
        return subscriptions.stream()
                .collect(Collectors.groupingBy(Subscription::category, LinkedHashMap::new, Collectors.toList()))
                .entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .map(entry -> new OverlapAlert(
                        entry.getKey(), entry.getValue().stream().map(Subscription::name).toList(),
                        entry.getValue().stream().map(Subscription::amount).min(Comparator.naturalOrder()).orElse(ZERO),
                        "Je hebt meerdere abonnementen in dezelfde categorie."))
                .toList();
    }

    private List<PreDebitAlert> findPreDebitAlerts(List<Subscription> subscriptions) {
        LocalDate today = LocalDate.now(clock);
        return subscriptions.stream()
                .map(subscription -> new AlertCandidate(subscription,
                        ChronoUnit.DAYS.between(today, subscription.nextDate())))
                .filter(candidate -> candidate.daysUntilDebit() >= 2 && candidate.daysUntilDebit() <= 3)
                .map(candidate -> new PreDebitAlert(
                        candidate.subscription().name(), candidate.subscription().amount(),
                        candidate.subscription().nextDate(),
                        candidate.daysUntilDebit(), "Afschrijving binnen " + candidate.daysUntilDebit() + " dagen."))
                .toList();
    }

    private Reserve reserve(BigDecimal monthlyRequired) {
        BigDecimal remaining = reserveTarget.get().subtract(monthlyRequired).setScale(2, RoundingMode.HALF_UP);
        return new Reserve(reserveEnabled.get(), reserveTarget.get(), monthlyRequired, remaining);
    }

    private static BigDecimal total(List<Subscription> subscriptions) {
        return subscriptions.stream().map(Subscription::amount).reduce(ZERO, BigDecimal::add).setScale(2,
                RoundingMode.HALF_UP);
    }

    private static Subscription withStatus(Subscription subscription, SubscriptionStatus status) {
        return new Subscription(subscription.id(), subscription.name(), subscription.category(), subscription.amount(),
                subscription.frequency(), subscription.nextDate(), subscription.confidence(), subscription.reason(),
                status);
    }

    private static Transaction tx(String merchant, String amount, String date) {
        return new Transaction(merchant, new BigDecimal(amount), LocalDate.parse(date));
    }

    private record Profile(String category) {
    }

    private record AlertCandidate(Subscription subscription, long daysUntilDebit) {
    }
}

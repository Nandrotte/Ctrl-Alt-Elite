package be.tectonic.subscription;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static be.tectonic.subscription.ApiModels.*;

@RestController
@RequestMapping("/api")
public class SubscriptionController {
    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Health health() {
        return new Health("ok", "subscription-backend");
    }

    @GetMapping("/dashboard")
    public Dashboard dashboard() {
        return service.dashboard();
    }

    @GetMapping("/transactions")
    public List<Transaction> transactions() {
        return service.transactions();
    }

    @GetMapping("/subscriptions")
    public List<Subscription> subscriptions() {
        return service.subscriptions();
    }

    @PatchMapping("/subscriptions/{id}/status")
    public Subscription updateStatus(@PathVariable long id, @Valid @RequestBody StatusRequest request) {
        try {
            return service.updateStatus(id, request.status());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found");
        }
    }

    @PostMapping("/reserve")
    public Reserve updateReserve(@Valid @RequestBody ReserveRequest request) {
        return service.updateReserve(request.enabled(), request.monthlyTarget());
    }

    public record Health(String status, String service) {
    }
}

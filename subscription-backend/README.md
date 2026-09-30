# Subscription backend

Spring Boot 3.4 mock API for the subscription manager.

## Run

```powershell
mvn spring-boot:run
```

The API listens on `http://localhost:8080`.

## Endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/transactions`
- `GET /api/subscriptions`
- `PATCH /api/subscriptions/{id}/status`
- `POST /api/reserve`

The data is deliberately in memory and fictitious. No bank credentials, database, or external payment system is used.

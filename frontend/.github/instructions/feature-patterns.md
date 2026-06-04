# Feature Development Patterns

---

## Feature Structure Rule

Each feature must follow this structure:

features/
  feature-name/
    component/
    services/
    models (if needed)

---

## Service Responsibility Rule

- Feature services handle:
  - API calls
  - feature-specific state
  - orchestration logic

- Feature services MUST NOT:
  - access DOM directly
  - bypass HttpClientService
  - manage global auth state

---

## State Management Rule

- Use signals for local feature state
- Use computed() for derived feature state
- Avoid RxJS subjects for UI state

---

## Communication Rule

- Cross-feature communication must go through:
  - shared services OR
  - core domain services (AuthService, UserService)

---

## Dependency Rule

Allowed dependencies:

Feature → Core services → Infrastructure services

Forbidden:

Feature → Feature direct service access (tight coupling)

---

## API Rule

- All HTTP calls must go through HttpClientService
- Feature services must not directly inject HttpClient

---

## Component Rule

- Components should be:
  - dumb UI
  - delegate logic to services
  - minimal business logic

---

## Anti-patterns

- Fat components with business logic
- Duplicate API calls across components
- Direct use of interceptor logic in features
- Manual global state handling
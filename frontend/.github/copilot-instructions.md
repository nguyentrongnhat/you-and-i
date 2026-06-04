# Angular SSR Architecture Rules (Project Copilot Context)

This project is an Angular 21+ standalone SSR application using:
- Signals-based state management
- RxJS only for async workflows
- PrimeNG UI framework
- Functional HTTP interceptors
- SSR hydration enabled

---

# 1. Architecture Principles

- Strict layered architecture:
  Feature Layer → Domain Services → Core Services → Infrastructure
- Never bypass service layers (HttpClientService, AuthService, ToastService)
- No direct DOM manipulation (SSR-safe requirement)
- No direct HttpClient usage in features

---

# 2. State Management Rules

- Use Angular Signals for state management
- Use computed() for derived state
- RxJS is only for async HTTP flows
- Do NOT introduce NgRx or BehaviorSubject stores unless explicitly required

---

# 3. SSR Rules

- Always check PlatformService.isBrowser() before using browser APIs
- No access to window/document/sessionStorage directly
- SessionStorage access MUST go through SessionStorageService
- Code must be SSR-safe by default

---

# 4. HTTP & API Rules

- All HTTP requests must go through HttpClientService
- Base URL is centralized in environment.apiBaseUrl
- No direct HttpClient injection in feature services
- All requests automatically pass through authInterceptor

---

# 5. Authentication System Rules

- AuthService is the single source of truth for authentication
- Access token is stored in signal (_accessToken)
- JWT parsing ONLY inside AuthService
- Derived auth state MUST use computed()
- Refresh token flow is handled in interceptor only

---

# 6. Interceptor Rules

- authInterceptor handles:
  - Attach Authorization header
  - Handle 401/403
  - Refresh token flow
- Only ONE refresh request allowed at a time
- All concurrent requests must wait for refresh completion
- No business logic inside interceptor

---

# 7. Routing & Layout Rules

- Layout is controlled via route.data.layout
- App component selects layout dynamically
- Do not hardcode layout inside components
- Navigation items must follow ROUTE_PATHS constants

---

# 8. UI Rules

- PrimeNG is global UI framework
- Toast notifications must use ToastService only
- MessageService must NEVER be used directly
- Global <p-toast /> exists in App component

---

# 9. Platform Rules

- PlatformService controls browser detection
- isMobile / isSmallMobileDevice used for UI behavior
- Never directly use navigator or window checks

---

# 10. Storage Rules

- sessionStorage access ONLY via SessionStorageService
- No direct browser storage usage
- SSR-safe storage access required

---

# 11. Domain Rules

- UserService is derived state from AuthService
- Do not duplicate user state anywhere else
- Roles MUST come from JWT payload only

---

# 12. Anti-patterns (STRICTLY FORBIDDEN)

- Direct HttpClient usage in feature services
- Direct MessageService usage
- window/document/sessionStorage direct usage
- Duplicated auth state outside AuthService
- Mixing layout logic inside feature components
- Creating custom global state stores outside Signals pattern
- Adding redundant RxJS stores for UI state

---

# 13. Coding Style Expectations

- Prefer functional + signal-based patterns
- Keep services thin and composable
- Keep business logic in services, not components
- Use inject() instead of constructor injection

---

# 14. SSR Safety Final Rule

If unsure:
→ assume code runs on server
→ avoid browser APIs
→ use PlatformService check
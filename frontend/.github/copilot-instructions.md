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

---

# 15. UI Design Standard (Tables, Cards & Pagination)

This is the single source of truth for designing data tables and similar surfaces.
All new tables MUST follow this standard so the app stays visually consistent.

## 15.0 Space & layout principle (applies to ALL surfaces)
- AVOID wrapping elements inside a card/row — prefer keeping a logical row on a
  single line (`flex-wrap: nowrap`) to make the most of horizontal space.
- Elements on the same row SHOULD span the full width of the row and distribute
  spacing evenly. Use `display: flex; width: 100%` with `justify-content: space-between`
  (or `gap` + a flexible `flex: 1` element) instead of fixed-width clusters.
- Let the primary flexible element grow (`flex: 1 1 auto`) so the row never leaves
  empty gaps; secondary controls keep their intrinsic size.
- Only allow wrapping as a responsive fallback at `v.$breakpoint-xs` and below.

## 15.1 Theming
- ALWAYS use PrimeNG theme CSS variables with a fallback, e.g.
  `var(--p-text-color, #111827)`, `var(--p-content-border-color, #e5e7eb)`,
  `var(--p-primary-color, #6366f1)`, `var(--p-content-hover-background, #f9fafb)`.
- NEVER hardcode raw colors without a theme variable (keeps light/dark in sync).
- Import shared breakpoints in SCSS: `@use "variables" as v;` and use
  `v.$breakpoint-xs` etc. for responsive rules.


## 15.2 User / entity cells
- Show an avatar + 2-line info (name + muted `@username` / secondary line).
- Avatar fallback uses initials with `background: var(--p-primary-color)` and a
  white ring; truncate long text with ellipsis.

## 15.3 Empty state
- Use `#emptymessage` with a centered block: large muted `pi` icon + short text,
  generous padding (~2.75rem). Class `&__empty`.

## 15.4 Responsiveness
- Hide non-essential columns on small mobile via `PlatformService.isSmallMobileDevice()`
  (never via raw `window` checks).
- Keep the same column-hiding pattern in both header and body templates, and update
  the empty `colspan` accordingly.


# 16. Workflow & AI Execution Rules

- Break work into small, sequential steps.
- IMPORTANT: each step must NOT keep a connection open to the AI server for more
  than 30 seconds, to avoid the proxy dropping the connection mid-way.
- Keep each tool call / response focused and short so it completes well under the
  30s limit; split large edits across multiple steps instead of one long operation.

---

# 17. Minimalism UI Design Principles

These principles apply to ALL UI work (components, layouts, surfaces):

- UI must be simple, tidy, yet refined and MODERN — minimalism style.
- Optimize for airy, uncluttered display space; never make the screen busy or
  visually noisy.
- Light transparency effects may be applied to elements that benefit from them
  (e.g. headers, floating bars) — keep them subtle.
- Backgrounds should favor white or black with transparency (translucent
  surfaces), not heavy solid fills.
- Do NOT apply glow effects carelessly (no colored drop-shadows / box-shadow
  halos used as decoration).
- Drop tacky / "quê mùa" color gradients; prefer flat translucent surfaces with a
  single restrained accent (the primary color) used sparingly.
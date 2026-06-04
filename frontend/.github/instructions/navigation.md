# Navigation Rules

- Always use Angular Router (Router / RouterLink / navigateByUrl)
- Never use window.location for navigation (except hard fallback cases)
- All route paths must come from ROUTE_PATHS constants
- Navigation items should be centralized (do not hardcode in multiple components)

---

## Layout Navigation Rules

- Layout components (Layout1/2/3) are responsible for UI navigation rendering
- App component only handles layout switching, not navigation logic

---

## Active Route Handling

- Active state must be derived from Router events (NavigationEnd)
- Do not manually manage navigation state outside Router subscription

---

## Guarded Routes

- Authentication-required routes must use authGuard
- Browser-only routes must use browserOnlyMatchGuard

---

## Anti-patterns

- No manual URL parsing using window.location
- No duplication of navigation config across components
- No hardcoded string routes inside components
# HTTP Interceptor Rules

- Attach Bearer token automatically
- Skip auth endpoints (login, refresh)
- Handle 401/403 globally
- Single-flight refresh token logic required
- Queue requests during refresh
- Always clone requests before retry
- No business logic allowed in interceptor
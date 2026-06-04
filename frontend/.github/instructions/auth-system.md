# Authentication System Rules

- AuthService is the single source of truth
- Access token stored in signal
- JWT parsing only inside AuthService
- Derived auth state must use computed()
- isAuthenticated() returns Observable<boolean>
- Refresh token handled only in interceptor
- logout() clears token and navigates to login
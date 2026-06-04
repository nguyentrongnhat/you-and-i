# App Boot Configuration Rules

- app.config.ts is the single composition root
- All providers must be registered here
- HttpClient uses:
  withFetch + withInterceptors
- authInterceptor is globally registered here
- PrimeNG theme is globally configured here
# FORBIDDEN PATTERNS

- Direct HttpClient usage
- Direct MessageService usage
- window/document usage
- sessionStorage/localStorage direct usage
- Duplicated Auth state
- Global mutable state outside services
- Mixing layout logic into features
- Overusing RxJS for UI state
- Introducing external state management libs
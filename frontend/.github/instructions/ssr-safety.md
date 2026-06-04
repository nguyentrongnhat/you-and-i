# SSR Safety Rules

- Always guard browser APIs using PlatformService.isBrowser()
- No direct DOM manipulation
- No window/document usage
- SessionStorage only via SessionStorageService
- Avoid client-only assumptions in services
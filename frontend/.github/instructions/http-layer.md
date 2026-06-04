# HTTP Layer Rules

- All API calls must go through HttpClientService
- Base URL is centralized in environment
- request(), get(), post(), put(), delete() are standard API methods
- Never bypass HttpClientService
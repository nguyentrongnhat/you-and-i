export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_WITH_USERNAME_PASSWORD: '/auth/login',
    LOGIN_WITH_GOOGLE_AUTHORIZATION_CODE: '/auth/google/login',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
    REFRESH_TOKEN: '/auth/refresh',
    REFRESH_TOKEN_MOBILE: '/auth/refresh-mobile'
  }
} as const;
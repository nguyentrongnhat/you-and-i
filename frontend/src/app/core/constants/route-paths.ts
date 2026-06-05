export const ROUTE_PATHS = {
    HOME: {
        path: '',
        fullPath: '',
    },
    AUTH: {
        path: 'auth',
        fullPath: 'auth',
        children: {
            LOGIN: { path: 'login', fullPath: 'auth/login' },
            SIGNUP: { path: 'signup', fullPath: 'auth/signup' },
            VERIFY_ACCOUNT: { path: 'verify-account', fullPath: 'auth/verify-account' }
        }
    },
    GAME: {
        path: 'game',
        fullPath: 'game',
        children: {
            FIND_NUMBER_GAME: { path: 'find-number-game', fullPath: 'game/find-number-game' }
        }
    },
    USER: {
        path: 'user',
        fullPath: 'user',
        children: {
            MANAGEMENT: { path: 'management', fullPath: 'user/management' },
            EDIT_PROFILE: { path: 'edit-profile', fullPath: 'user/edit-profile' },
            DETAIL: { path: 'detail/:id', fullPath: 'user/detail/:id' }
        }
    }
} as const;

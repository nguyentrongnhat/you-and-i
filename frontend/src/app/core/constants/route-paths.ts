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
            FIND_NUMBER_GAME: { 
                path: 'find-number-game', 
                fullPath: 'game/find-number-game' ,
                children: {
                    START_SCREEN: { path: '', fullPath: 'game/find-number-game' },
                    PLAY_GAME_SCREEN: { path: 'play/:gameId', fullPath: 'game/find-number-game/play/:gameId' },
                    SUMMARY_GAME_SCREEN: { path: 'summary', fullPath: 'game/find-number-game/summary' }
                }
            }
        }
    },
    USER: {
        path: 'user',
        fullPath: 'user',
        children: {
            MANAGEMENT: { path: 'management', fullPath: 'user/management' },
            DETAIL: { path: 'details/:id', fullPath: 'user/details/:id' }
        }
    }
} as const;

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PlatformService } from '../../services/platform.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ROUTE_PATHS } from '../constants/route-paths';

let isRefreshingToken = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    
    const authService = inject(AuthService);
    
    const platformService = inject(PlatformService);
    
    const router = inject(Router);

    const accessToken = authService.accessToken();

    if (req.url.includes(API_ENDPOINTS.AUTH.LOGIN)) {
        return next(req);
    }

    if (req.url.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)) {
        return next(req).pipe(
            catchError(err => {
                if (platformService.isBrowser()) {
                    router.navigateByUrl(ROUTE_PATHS.LOGIN);
                }
                return throwError(() => err);
            })
        );
    }

    const authReq = accessToken ? req.clone({
        setHeaders: {
            Authorization: `Bearer ${accessToken}`
        }
    }) : req;

    return next(authReq).pipe(
        catchError(err => {
            if (!platformService.isBrowser()) {
                return throwError(() => err);
            }

            if (err.status !== 401 && err.status !== 403) {
                return throwError(() => err);
            }

            //===== REFRESH TOKEN FLOW =====
            if (!isRefreshingToken) { 
                isRefreshingToken = true;
                refreshTokenSubject.next(null);

                return authService.refreshToken().pipe(
                    switchMap(res => {
                        isRefreshingToken = false;
                        authService.setAccessToken(res.accessToken);
                        refreshTokenSubject.next(res.accessToken);

                        return next(
                            req.clone({
                                setHeaders: {
                                Authorization: `Bearer ${res.accessToken}`
                                }
                            })
                        );
                    }),
                    catchError(refreshErr => {
                        isRefreshingToken = false;
                        authService.clearAccessToken();
                        router.navigateByUrl(ROUTE_PATHS.LOGIN);
                        return throwError(() => refreshErr);
                    })
                );
            }

            // ==== CÁC REQUEST KHÁC ĐỢI REFRESH ====
            return refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token =>
                    next(
                        req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                    )
                )
            );
        })
    );
};

import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, finalize, map, of, take, tap, throwError } from "rxjs";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import { UsernamePasswordLoginResponse } from "../../../core/interfaces/user.dtos";
import { HttpClientService } from "../../../services/http-client.service";
import { SignupModel } from "../signup/signup";
import { UserService } from "../../user-management/services/user.service";
import { LoaderService } from "../../../services/loader.service";
import { PlatformService } from "../../../services/platform.service";
import { SessionStorageService } from "../../../services/session-storage.service";
import { NavigationService } from "../../../services/navigation.service";
import { STORAGE_KEY } from "../../../core/enums";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly httpService = inject(HttpClientService);

    private readonly _accessToken = signal<string>('');

    public readonly accessToken = this._accessToken.asReadonly();

    private readonly router = inject(Router);

    private readonly userService = inject(UserService);

    private readonly loaderService = inject(LoaderService);

    private readonly platformService = inject(PlatformService);

    private readonly sessionStorageService = inject(SessionStorageService);

    private readonly navigationService = inject(NavigationService);


    public readonly accessTokenPayload = computed(() => {

        const accessToken = this._accessToken();

        if (!accessToken) return undefined;

        return this.parseJwt(accessToken);
    })


    public isAccessTokenValid = computed<boolean>(() => {
        return !!this._accessToken() && !this.isAccessTokenExp();
    })


    public isAuthenticated() {
        if(this.isAccessTokenValid()) return of(true);
        
        return this.refreshToken().pipe(
            map(() => true),
            catchError(() => of(false)),
        );
    }


    public setAccessToken(token: string) {
        this._accessToken.set(token);
    }


    public clearAccessToken() {
        this._accessToken.set('');
    }


    public login(username: string, password: string) {
        return this.httpService.post<UsernamePasswordLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { username, password })
            .pipe(
                tap(res => {
                    this.setAccessToken(res.accessToken);
                    this.userService.currentUser.set(res.userInfo);
                    if(this.platformService.isMobile()) {
                        this.sessionStorageService.setItem(STORAGE_KEY.REFRESH_TOKEN, res.refreshToken);
                    }
                })
            );
    }


    public logout() {
        this.loaderService.show();
        this.clearAccessToken();
        this.sessionStorageService.removeItem(STORAGE_KEY.REFRESH_TOKEN);
        this.httpService.post(API_ENDPOINTS.AUTH.SIGNOUT, {}).pipe(
            finalize(() => this.loaderService.hide()),
            take(1)
        ).subscribe({
            next: () => {
                this.navigationService.goToLogin();
            },
            error: (err) => console.log('Error during logout:', err)
        });
    }


    public refreshToken() {
        const refreshToken = this.sessionStorageService.getItem(STORAGE_KEY.REFRESH_TOKEN);
        const REFRESH_TOKEN_ENDPOINT = this.platformService.isMobile() ? API_ENDPOINTS.AUTH.REFRESH_TOKEN_MOBILE : API_ENDPOINTS.AUTH.REFRESH_TOKEN;
        return this.httpService.post<UsernamePasswordLoginResponse>(REFRESH_TOKEN_ENDPOINT, { refreshToken })
            .pipe(
                tap(res => {
                    this.setAccessToken(res.accessToken);
                    this.userService.currentUser.set(res.userInfo);
                    if(this.platformService.isMobile()) {
                        this.sessionStorageService.setItem(STORAGE_KEY.REFRESH_TOKEN, res.refreshToken);
                    }
                }),
                catchError((err) => {
                    this.sessionStorageService.setItem(STORAGE_KEY.REDIRECT_URL, this.router.url)
                    return throwError(() => err);
                })
            );
    }


    public signup(signupData: SignupModel) {
        return this.httpService.post<UsernamePasswordLoginResponse>(API_ENDPOINTS.AUTH.SIGNUP, signupData);
    }
    

    public parseJwt(token: string) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
    }


    public isAccessTokenExp(): boolean {
        if(!this._accessToken()) return true;
        const expTime = this.accessTokenPayload().exp;
        return Number(expTime) < Date.now() / 1000;
    }
}
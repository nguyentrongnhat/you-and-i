import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, map, of, tap } from "rxjs";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import { ROUTE_PATHS } from "../../../core/constants/route-paths";
import { UsernamePasswordLoginResponse } from "../../../core/interfaces/user.dtos";
import { HttpClientService } from "../../../services/http-client.service";
import { SignupModel } from "../signup/signup";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly httpService = inject(HttpClientService);

    private readonly _accessToken = signal<string>('');

    public readonly accessToken = this._accessToken.asReadonly();

    private readonly router = inject(Router);


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
            catchError(() => of(false))
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
                tap(res => this.setAccessToken(res.accessToken))
            );
    }


    public refreshToken() {
        return this.httpService.post<UsernamePasswordLoginResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {})
            .pipe(
                tap(res => this.setAccessToken(res.accessToken)),
            );
    }


    public signup(signupData: SignupModel) {
        console.log('Sign up for: ', signupData)
        return this.httpService.post<UsernamePasswordLoginResponse>(API_ENDPOINTS.AUTH.SIGNUP, signupData);
    }


    public logout() {
        this.clearAccessToken();
        this.router.navigateByUrl(ROUTE_PATHS.LOGIN);
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
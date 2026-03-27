import { inject, Injectable, signal } from "@angular/core";
import { UsernamePasswordLoginResponse } from "../core/interfaces/user.dtos";
import { SignupModel } from "../features/auth/signup/signup";
import { HttpClientService } from "./http-client.service";
import { API_ENDPOINTS } from "../core/constants/api-endpoints";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly httpService = inject(HttpClientService);
    private readonly _accessToken = signal<string>('')
    public readonly accessToken = this._accessToken.asReadonly();

    public setAccessToken(token: string) {
        this._accessToken.set(token);
    }

    public clearAccessToken() {
        this._accessToken.set('');
    }

    public login(username: string, password: string) {
        return this.httpService.post<UsernamePasswordLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { username, password });
    }

    public refreshToken() {
        return this.httpService.post<UsernamePasswordLoginResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {});
    }

    public signup(signupData: SignupModel) {
        console.log('Sign up for: ', signupData)
        return this.httpService.post<UsernamePasswordLoginResponse>(API_ENDPOINTS.AUTH.SIGNUP, signupData);
    }
}
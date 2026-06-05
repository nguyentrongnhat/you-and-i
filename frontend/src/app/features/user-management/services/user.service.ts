import { computed, inject, Injectable } from "@angular/core";
import { HttpClientService } from "../../../services/http-client.service";
import { AuthService } from "../../auth/services/auth.service";
import { UserDetails, UserProfile } from "../../../core/interfaces/user.dtos";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly httpClientService = inject(HttpClientService);

    private readonly authService = inject(AuthService);

    public currentUser = computed<UserDetails | undefined>(() => {
        const profile: UserProfile = this.authService.accessTokenPayload().profile;
        const roles: string[] = this.authService.accessTokenPayload().roles;

        const userInfo: UserDetails = {
            id: '',
            profile,
            roles,
            username: this.authService.accessTokenPayload()?.sub || '',
        };
        
        return userInfo;
    })

    public readonly userRoles = computed<string[]>(() => {
        const payload = this.authService.accessTokenPayload();
        return payload?.roles || [];
    })

    public getUserDetails(): Observable<UserDetails> {
        return this.httpClientService.get('/user');
    }

    public getAllUsers(): Observable<UserDetails[]> {
        return this.httpClientService.get('/user/all');
    }

    public updateUserData(userData: any): Observable<UserDetails> {
        return this.httpClientService.put('/user/update', userData);
    }
}
import { computed, inject, Injectable } from "@angular/core";
import { HttpClientService } from "../../../services/http-client.service";
import { AuthService } from "../../auth/services/auth.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly httpClientService = inject(HttpClientService);

    private readonly authService = inject(AuthService);

    public userProfile = computed(() => {
        const userInfo = this.authService.accessTokenPayload();
        return userInfo?.profile;
    })

    public readonly userRoles = computed<string[]>(() => {
        const payload = this.authService.accessTokenPayload();
        return payload?.roles || [];
    })

    public getProfile() {
        return this.httpClientService.get('/user', { responseType: 'text' });
    }

    public getAllUsers() {
        return this.httpClientService.get('/user/all');
    }

    public updateUserData(userData: any) {
        return this.httpClientService.put('/user/update', userData);
    }
}
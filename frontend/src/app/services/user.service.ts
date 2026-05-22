import { inject, Injectable } from "@angular/core";
import { HttpClientService } from "./http-client.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly httpClientService = inject(HttpClientService);

    public getProfile() {
        return this.httpClientService.get('/user', { responseType: 'text' });
    }

    public getAllUsers() {
        return this.httpClientService.get('/user/all');
    }
}
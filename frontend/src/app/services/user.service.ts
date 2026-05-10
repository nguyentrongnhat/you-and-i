import { inject, Injectable } from "@angular/core";
import { HttpClientService } from "./http-client.service";
import { text } from "stream/consumers";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private httpClientService = inject(HttpClientService);

    public getCurrentUser() {
        return this.httpClientService.get('/user', { responseType: 'text' });
    }
}
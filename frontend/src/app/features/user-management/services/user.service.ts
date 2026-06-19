import { computed, inject, Injectable, signal } from "@angular/core";
import { Observable } from "rxjs";
import { UserDetails } from "../../../core/interfaces/user.dtos";
import { HttpClientService } from "../../../services/http-client.service";
import { ROLE } from "../../../core/enums";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly httpClientService = inject(HttpClientService);

    public currentUser = signal<UserDetails | undefined>(undefined);

    public readonly userRoles = computed<string[]>(() => {
        return this.currentUser()?.roles || [];
    })

    public getUserDetailsById(id: string): Observable<UserDetails> {
        return this.httpClientService.get(`/user/${id}`);
    }

    public getAllUsers(): Observable<UserDetails[]> {
        return this.httpClientService.get('/user/all');
    }

    public updateUserData(userData: any): Observable<UserDetails> {
        return this.httpClientService.put('/user/update', userData);
    }

    public hasRoles(requiredRoles: ROLE[], combination: 'AND' | 'OR' = 'AND'): boolean {
        const currentRoles = this.userRoles();
        if (!currentRoles) return false;

        if (combination === 'AND') {
            return requiredRoles.every(role => currentRoles.includes(role));
        } else {
            return requiredRoles.some(role => currentRoles.includes(role));
        }
    }
}
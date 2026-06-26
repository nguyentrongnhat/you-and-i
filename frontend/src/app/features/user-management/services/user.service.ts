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

    public extractAvatarFromName(name: string): string {
        const parts = name.split(' ').filter(Boolean);
        if (parts.length === 0) return 'U';
        
        const lastPart = parts[parts.length - 1];

        // Kiểm tra từ cuối có phải emoji không
        const emojiRegex = /^\p{Extended_Pictographic}$/u;

        if (emojiRegex.test(lastPart)) return lastPart;

        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
}
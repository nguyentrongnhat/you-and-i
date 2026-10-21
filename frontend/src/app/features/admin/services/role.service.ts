import { inject, Injectable, signal } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { HttpClientService } from "../../../services/http-client.service";

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly httpClientService = inject(HttpClientService);

    private _roles = signal<string[] | undefined>(undefined);

    public roles = this._roles.asReadonly();

    public getAllRoles(): Observable<string[]> {
        if (this._roles()) {
            return of(this._roles() ?? []);
        }
        return this.httpClientService.get<string[]>('/role').pipe(
            tap((roles: string[]) => this._roles.set(roles))
        );
    }
}
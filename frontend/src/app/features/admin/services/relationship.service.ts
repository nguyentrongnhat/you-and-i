import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { LoaderService } from '../../../services/loader.service';
import { Relationship } from '../../../core/interfaces/relationship.dto';
import { HttpClientService } from '../../../services/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class RelationshipService {
    private readonly httpClientService = inject(HttpClientService);

    private readonly allRelationships = signal<Relationship[]>([]);

    private readonly loaderService = inject(LoaderService);

    public getAllRelationships(): Observable<Relationship[]> {
        return this.httpClientService.get<Relationship[]>('/relationship')
            .pipe(tap((relationships) => {
                this.allRelationships.set(relationships);
            }));
    }

    public getRelationshipById(id: string): Observable<Relationship> {
        const cacheRelationship = this.allRelationships().find(r => r.id === id);
        if (cacheRelationship) {
            return of(cacheRelationship);
        }
        return this.httpClientService.get<Relationship>(`/relationship/${id}`).pipe(
            tap((relationship) => {
                const current = this.allRelationships();
                this.allRelationships.set([...current, relationship]);
            })
        );

    }

    public createRelationship(request: Relationship): Observable<Relationship> {
        return this.httpClientService.post<Relationship>('/relationship/create', request).pipe(
            tap((relationship) => {
                const current = this.allRelationships();
                this.allRelationships.set([...current, relationship]);
            })
        );
    }
    
    public updateRelationship(request: Relationship): Observable<Relationship> {
        return this.httpClientService.put<Relationship>(`/relationship/update/${request.id}`, request).pipe(
            tap((relationship) => {
                const current = this.allRelationships();
                const index = current.findIndex(r => r.id === relationship.id);
                if (index !== -1) {
                    current[index] = relationship;
                    this.allRelationships.set([...current]);
                }
            })
        );
    }

    public deleteRelationship(id: string): Observable<void> {
        return this.httpClientService.delete<void>(`/relationship/delete/${id}`).pipe(
            tap(() => {
                this.allRelationships.set(
                    this.allRelationships().filter((relationship) => relationship.id !== id)
                );
            })
        );
    }

}
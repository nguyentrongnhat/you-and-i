import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Relationship } from '../../../core/interfaces/relationship.dto';
import { HttpClientService } from '../../../services/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class RelationshipService {
    private readonly httpClientService = inject(HttpClientService);

    public getAllRelationships(): Observable<Relationship[]> {
        return this.httpClientService.get<Relationship[]>('/relationship');
    }

}
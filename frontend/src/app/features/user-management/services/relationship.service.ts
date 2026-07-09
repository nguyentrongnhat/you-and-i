import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    AddMemberRequest,
    CreateRelationshipRequest,
    Relationship,
    RelationshipMember,
    UpdateMemberRoleRequest,
    UpdateRelationshipRequest,
} from '../../../core/interfaces/relationship.dtos';
import { HttpClientService } from '../../../services/http-client.service';

@Injectable({
    providedIn: 'root',
})
export class RelationshipService {
    private readonly httpClientService = inject(HttpClientService);

    private readonly baseUrl = '/relationships';

    /** Get all relationships a specific user is a member of (admin only). */
    public getRelationshipsByUserId(userId: string): Observable<Relationship[]> {
        return this.httpClientService.get(`${this.baseUrl}/user/${userId}`);
    }

    public getRelationshipById(id: string): Observable<Relationship> {
        return this.httpClientService.get(`${this.baseUrl}/${id}`);
    }

    public createRelationship(
        payload: CreateRelationshipRequest
    ): Observable<Relationship> {
        return this.httpClientService.post(this.baseUrl, payload);
    }

    public updateRelationship(
        id: string,
        payload: UpdateRelationshipRequest
    ): Observable<Relationship> {
        return this.httpClientService.put(`${this.baseUrl}/${id}`, payload);
    }

    public deleteRelationship(id: string): Observable<void> {
        return this.httpClientService.delete(`${this.baseUrl}/${id}`);
    }

    public getMembers(id: string): Observable<RelationshipMember[]> {
        return this.httpClientService.get(`${this.baseUrl}/${id}/members`);
    }

    public addMember(
        id: string,
        payload: AddMemberRequest
    ): Observable<RelationshipMember> {
        return this.httpClientService.post(`${this.baseUrl}/${id}/members`, payload);
    }

    public updateMemberRole(
        id: string,
        memberId: string,
        payload: UpdateMemberRoleRequest
    ): Observable<RelationshipMember> {
        return this.httpClientService.put(
            `${this.baseUrl}/${id}/members/${memberId}/role`,
            payload
        );
    }

    public removeMember(id: string, memberId: string): Observable<void> {
        return this.httpClientService.delete(
            `${this.baseUrl}/${id}/members/${memberId}`
        );
    }
}

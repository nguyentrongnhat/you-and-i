import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../enviroments/environments";
import { ApiOptions, RequestDTO } from "../core/interfaces/request.dtos";

@Injectable({providedIn: 'root'})
export class HttpClientService {
    private readonly http = inject(HttpClient);

    private readonly BASE_URL = environment.apiBaseUrl;

    private buildOptions(options?: ApiOptions) {
        return {
            withCredentials: true,
            ...options
        };
    }

    public request<T>(requestDto: RequestDTO) {
        let { host, url, ...options } = requestDto;
        url = (host ?? this.BASE_URL) + url;
        return this.http.request<T>(requestDto.method, url, options);
    }

    public get<T>(url: string, options?: ApiOptions): Observable<T> {
        return this.http.get<T>(this.BASE_URL + url, this.buildOptions(options));
    }

    public post<T, B = unknown>(url: string, body: B, options?: ApiOptions): Observable<T> {
        return this.http.post<T>(
            this.BASE_URL + url,
            body,
            this.buildOptions(options)
        );
    }

    public put<T, B = unknown>(url: string, body: B, options?: ApiOptions): Observable<T> {
        return this.http.put<T>(
            this.BASE_URL + url,
            body,
            this.buildOptions(options)
        );
    }

    public delete<T>(url: string, options?: ApiOptions): Observable<T> {
        return this.http.delete<T>(
            this.BASE_URL + url,
            this.buildOptions(options)
        );
    }
}
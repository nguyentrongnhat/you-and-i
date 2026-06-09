import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { EMPTY, Observable } from "rxjs";
import { environment } from "../../enviroments/environments";
import { ApiOptions, RequestDTO } from "../core/interfaces/request.dtos";
import { PlatformService } from "./platform.service";

@Injectable({providedIn: 'root'})
export class HttpClientService {
    private readonly http = inject(HttpClient);

    private readonly platformService = inject(PlatformService);

    private readonly BASE_URL = environment.apiBaseUrl;

    private buildOptions(options?: ApiOptions) {
        return {
            withCredentials: true,
            ...options
        };
    }

    public request<T>(requestDto: RequestDTO, onlyBrowser: boolean = true): Observable<T> {
        if (onlyBrowser && !this.platformService.isBrowser()) {
            return EMPTY;
        }
        let { host, url, ...options } = requestDto;
        url = (host ?? this.BASE_URL) + url;
        return this.http.request<T>(requestDto.method, url, options);
    }

    public get<T>(url: string, options?: ApiOptions, onlyBrowser: boolean = true): Observable<T> {
        if (onlyBrowser && !this.platformService.isBrowser()) {
            return EMPTY;
        }
        return this.http.get<T>(this.BASE_URL + url, this.buildOptions(options));
    }

    public post<T, B = unknown>(url: string, body: B, options?: ApiOptions, onlyBrowser: boolean = true): Observable<T> {
        if (onlyBrowser && !this.platformService.isBrowser()) {
            return EMPTY;
        }
        return this.http.post<T>(
            this.BASE_URL + url,
            body,
            this.buildOptions(options)
        );
    }

    public put<T, B = unknown>(url: string, body: B, options?: ApiOptions, onlyBrowser: boolean = true): Observable<T> {
        if (onlyBrowser && !this.platformService.isBrowser()) {
            return EMPTY;
        }
        return this.http.put<T>(
            this.BASE_URL + url,
            body,
            this.buildOptions(options)
        );
    }

    public delete<T>(url: string, options?: ApiOptions, onlyBrowser: boolean = true): Observable<T> {
        if (onlyBrowser && !this.platformService.isBrowser()) {
            return EMPTY;
        }
        return this.http.delete<T>(
            this.BASE_URL + url,
            this.buildOptions(options)
        );
    }
}
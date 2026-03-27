import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export interface ApiOptions {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | number | boolean };
}

export enum HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
    HEAD = 'HEAD'
}

export class ResponseBodyDTO {
    status!: string
    error?: string
}

export interface RequestDTO {
    method: HTTP_METHOD;
    host?: string;
    url: string,
    body?: any;
    headers?: HttpHeaders | Record<string, string | string[]>;
    context?: HttpContext;
    observe?: 'body';
    params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    responseType?: 'json';
    reportProgress?: boolean;
    withCredentials?: boolean;
    credentials?: RequestCredentials;
    keepalive?: boolean;
    priority?: RequestPriority;
    cache?: RequestCache;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;
    referrerPolicy?: ReferrerPolicy;
    transferCache?: {
        includeHeaders?: string[];
    } | boolean;
    timeout?: number;
    responseBody: ResponseBodyDTO
}
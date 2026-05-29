import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private readonly _isLoading = signal<boolean>(false);

    public readonly isLoading = this._isLoading.asReadonly();

    public show() {
        this._isLoading.set(true);
    }

    public hide() {
        this._isLoading.set(false);
    }
}
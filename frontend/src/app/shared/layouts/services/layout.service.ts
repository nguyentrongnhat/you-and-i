import { Injectable, signal } from "@angular/core";
import { LAYOUT } from "../../../core/enums";

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
    private readonly _activeLayout = signal<string>(LAYOUT.EMPTY_LAYOUT);

    public readonly activeLayout = this._activeLayout.asReadonly();

    public set(layout: string) {
        this._activeLayout.set(layout);
    }
}
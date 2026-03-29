import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class VerifyAccountService {
    private _emailToBeVerified: string = '';
    private _isVerificationCodeSent: boolean = false;

    get emailToBeVerified(): string {
        return this._emailToBeVerified;
    }

    set emailToBeVerified(value: string) {
        this._emailToBeVerified = value;
    }

    get isVerificationCodeSent(): boolean {
        return this._isVerificationCodeSent;
    }

    set isVerificationCodeSent(value: boolean) {
        this._isVerificationCodeSent = value;
    }
}
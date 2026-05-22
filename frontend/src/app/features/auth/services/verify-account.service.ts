import { inject, Injectable } from "@angular/core";
import { HttpClientService } from "../../../services/http-client.service";
import { tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class VerifyAccountService {
    private readonly httpClientService = inject(HttpClientService);

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


    public requestVerificationCode(email: string) {
        return this.httpClientService.post('/auth/verification-code', { email }).pipe(
            tap(() => {
                this.emailToBeVerified = email;
                this.isVerificationCodeSent = true;
            })
        );
    }
    

    public verifyEmail(email: string, verificationCode: string) {       
        return this.httpClientService.post('/auth/verify-account', { email, verificationCode });
    };

}
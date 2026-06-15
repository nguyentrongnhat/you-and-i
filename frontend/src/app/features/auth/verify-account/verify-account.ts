import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { email, form, FormField, minLength, required, schema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AutoFocusModule } from 'primeng/autofocus'; // This module is not used in the template.
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FocusTrapModule } from 'primeng/focustrap';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputOtp } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HttpClientService } from '../../../services/http-client.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ToastService } from '../../../services/toast.service';
import { VerifyAccountService } from '../services/verify-account.service';
import { ROUTE_PATHS } from '../../../core/constants/route-paths';
import { MESSAGE_TYPE } from '../../../core/enums';
import { LoaderService } from '../../../services/loader.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlatformService } from '../../../services/platform.service';

export interface EmailVerificationModel {
  email: string,
  verificationCode: string,
}

export const initialData: EmailVerificationModel = {
  email: '',
  verificationCode: ''
}

export const getVerificationCodeSchema = schema<EmailVerificationModel>((root) => {
  required(root.email, { message: 'Email is required', when: context => context.stateOf(root.email).touched() });
  email(root.email, { message: 'Please enter the valid email address'});
})

export const emailVerificationSchema = schema<EmailVerificationModel>((root) => {
  required(root.email, { message: 'Email is required', when: context => context.stateOf(root.email).touched() });
  required(root.verificationCode, { message: 'Verification code is required', when: context => context.stateOf(root.verificationCode).touched() });
  email(root.email, { message: 'Please enter the valid email address' });
  minLength(root.verificationCode, 6, { message: 'min length 6' });
})

@Component({
  selector: 'app-verify-account',
  imports: [
    CommonModule,
    FocusTrapModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    InputOtp,
    PasswordModule,
    DividerModule,
    FormField,
  ],
  templateUrl: './verify-account.html',
  styleUrl: './verify-account.scss',
})
export class VerifyAccount implements OnInit, OnDestroy, AfterViewInit {

  private readonly verifyAccountService = inject(VerifyAccountService);

  protected sessionStorageService = inject(SessionStorageService);

  protected toastService = inject(ToastService);

  protected router = inject(Router);

  private readonly httpService = inject(HttpClientService);
  
  protected emailVerificationFormData = signal<EmailVerificationModel>(initialData);

  protected getVerificationCodeForm = form(this.emailVerificationFormData, getVerificationCodeSchema);

  protected emailVerificationForm = form(this.emailVerificationFormData, emailVerificationSchema);

  protected timeRemainingToGetCodeAgain = signal<number>(30);

  protected submitGetVerificationCodeButtonSeverity = computed(() =>
    this.getVerificationCodeForm().invalid() || !this.emailVerificationFormData().email ? 'secondary' : 'contrast'
  );

  protected submitEmailVerificationButtonSeverity = computed(() =>
    this.emailVerificationForm().invalid() || !this.emailVerificationFormData().verificationCode || this.emailVerificationFormData().verificationCode.toString().length < 6 ? 'secondary' : 'contrast'
  );

  protected isRequestedCode = signal<boolean>(false);

  private countDownInterval!: ReturnType<typeof setInterval>;

  private readonly destroyRef = inject(DestroyRef);

  private readonly loaderService = inject(LoaderService);

  private readonly platformService = inject(PlatformService);

  constructor() {
    effect(() => {
      const isRequestedCode = this.isRequestedCode()
      console.log('chay effect: ', isRequestedCode)
      if(!isRequestedCode) return;
      this.availableResendCodeCountdown();
    })

    effect(() => {
      const timer = this.timeRemainingToGetCodeAgain()
      if(timer <= 0) {
        clearInterval(this.countDownInterval);
      }
    })
  }
  
  ngAfterViewInit(): void {
    if(!this.platformService.isBrowser()) return;
    this.loaderService.hide();
  }


  ngOnDestroy(): void {
    clearInterval(this.countDownInterval);
  }
  

  ngOnInit(): void {
    if(this.verifyAccountService.emailToBeVerified) {
      initialData.email = this.verifyAccountService.emailToBeVerified;
      this.emailVerificationFormData.set(initialData);
    }
    if(this.verifyAccountService.isVerificationCodeSent) {
      this.isRequestedCode.set(true);
      this.verifyAccountService.isVerificationCodeSent = false;
    }
  }


  protected availableResendCodeCountdown() {
    clearInterval(this.countDownInterval);
    this.countDownInterval = setInterval(() => {
      if(this.timeRemainingToGetCodeAgain() > 0) {
        this.timeRemainingToGetCodeAgain.update(v => v-1);
      }
    }, 1000)
  }

  /**
   * Handles the submission for requesting a new verification code.
   */
  protected onSubmitRequestCode() {
    if(this.getVerificationCodeForm().invalid()) return;

    this.loaderService.show();
    this.verifyAccountService.requestVerificationCode(this.emailVerificationFormData().email)
    .pipe(
      finalize(() => this.loaderService.hide()),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (res) => {
        this.isRequestedCode.set(true);
        this.availableResendCodeCountdown();
      },
      error: (err) => {
        console.log(err.error.message)
        const toastSummary = 'Verification failed';
        const toastDetail = err.error.message;
        console.log('Login error: ', err.error);
        this.toastService.showToast(MESSAGE_TYPE.WARN, toastSummary, toastDetail);
      },
      complete: () => console.log('complete')
    })
  }

  /**
   * Handles the submission for verifying the email with the provided code.
   */
  protected onSubmitVerificationCode() {
    if(this.emailVerificationForm().invalid()) return;

    this.loaderService.show();
    const {email, verificationCode} = this.emailVerificationFormData();
    this.verifyAccountService.verifyEmail(email, verificationCode)
    .pipe(
      finalize(() => this.loaderService.hide()),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (res) => {
        this.router.navigateByUrl(ROUTE_PATHS.AUTH.children.LOGIN.fullPath);
      },
      error: (err) => {
        console.log(err.error.message)
        const toastSummary = 'Verification failed';
        const toastDetail = err.error.message;
        console.log('Login error: ', err.error);
        this.toastService.showToast(MESSAGE_TYPE.WARN, toastSummary, toastDetail);
      },
      complete: () => console.log('complete')
    })
  }

  /**
   * Resets the countdown and allows requesting the code again.
   */
  protected getCodeAgain() {
    this.timeRemainingToGetCodeAgain.set(30);
    this.isRequestedCode.set(false);
  }
}

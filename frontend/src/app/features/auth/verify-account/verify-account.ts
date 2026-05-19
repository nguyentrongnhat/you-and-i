import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { email, form, FormField, minLength, required, schema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FocusTrapModule } from 'primeng/focustrap';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputOtp } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { PlatformService } from '../../../services/platform.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../services/auth.service';
import { VerifyAccountService } from '../services/verify-account.service';

export interface EmailVerificationModel {
  email: string,
  verificationCode: string,
}

export const initialData: EmailVerificationModel = {
  email: 'admin@admin.com',
  verificationCode: ''
}

export const getVerificationCodeSchema = schema<EmailVerificationModel>((root) => {
  required(root.email, { message: 'Email is required'});
  email(root.email, { message: 'Please enter the valid email address'});
})

export const emailVerificationSchema = schema<EmailVerificationModel>((root) => {
  required(root.email, { message: 'Email is required'});
  required(root.verificationCode, { message: 'Verification code is required'});
  email(root.email, { message: 'Please enter the valid email address'});
  minLength(root.verificationCode, 6, { message: 'min length 6'});
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
export class VerifyAccount implements OnInit, OnDestroy {
  
  protected platformService = inject(PlatformService);

  private readonly authService = inject(AuthService);

  private readonly verifyAccountService = inject(VerifyAccountService);

  protected sessionStorageService = inject(SessionStorageService);

  protected toastService = inject(ToastService);

  protected router = inject(Router);
  
  protected emailVerificationFormData = signal<EmailVerificationModel>(initialData);

  protected getVerificationCodeForm = form(this.emailVerificationFormData, getVerificationCodeSchema);

  protected emailVerificationForm = form(this.emailVerificationFormData, emailVerificationSchema);

  protected timeRemainingToGetCodeAgain = signal<number>(10);

  protected submitGetVerificationCodeButtonSeverity = computed(() =>
    this.getVerificationCodeForm().invalid() ? 'secondary' : 'contrast'
  );

  protected submitEmailVerificationButtonSeverity = computed(() =>
    this.emailVerificationForm().invalid() ? 'secondary' : 'contrast'
  );

  protected isRequestedCode = signal<boolean>(false);

  private countDownInterval!: ReturnType<typeof setInterval>;

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


  availableResendCodeCountdown() {
    clearInterval(this.countDownInterval);
    this.countDownInterval = setInterval(() => {
      if(this.timeRemainingToGetCodeAgain() > 0) {
        this.timeRemainingToGetCodeAgain.update(v => v-1);
      }
    }, 1000)
  }


  protected onSubmitRequestCode() {
    console.log('request verification code for: ', this.getVerificationCodeForm())
    setTimeout(() => { 
      this.isRequestedCode.set(true) 
      console.log('set thanh true')
    }, 500)
  }


  protected onSubmitVerificationCode() {
    console.log('verify ne')
    console.log('verify form: ', this.emailVerificationFormData())
  }


  protected getCodeAgain() {
    this.timeRemainingToGetCodeAgain.set(10);
    this.isRequestedCode.set(false);
  }
}

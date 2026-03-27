import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
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
import { AuthService } from '../../../services/auth.service';
import { PlatformService } from '../../../services/platform.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ToastService } from '../../../services/toast.service';

export interface SignupModel {
  username: string,
  password: string,
  confirmPassword: string,
  isAcceptedTerm: boolean
}

export const initialData: SignupModel = {
  username: 'admin@admin.com',
  password: '',
  confirmPassword: '',
  isAcceptedTerm: true
}

export enum PASSWORD_FIELD_TYPE {
  PASSWORD = 'password',
  CONFIRM_PASSWORD = 'confirm_password'
}

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
export class VerifyAccount{
  protected platformService = inject(PlatformService);

  private readonly authService = inject(AuthService);

  protected sessionStorageService = inject(SessionStorageService);

  protected toastService = inject(ToastService);

  protected router = inject(Router);
  
  protected signupModel = signal<SignupModel>(initialData);

  protected signupForm = form(this.signupModel)//, signupSchema);

  protected submitButtonSeverity = computed(() =>
    this.signupForm().invalid() ? 'secondary' : 'contrast'
  );

  protected isRequested = signal<boolean>(false);

  protected onSubmit() {
    console.log('submit code')
    setTimeout(() => { this.isRequested.set(true) }, 500)
  }
}

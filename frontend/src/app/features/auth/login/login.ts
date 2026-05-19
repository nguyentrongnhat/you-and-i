import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { email, form, FormField, required, schema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { FocusTrapModule } from 'primeng/focustrap';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ROUTE_PATHS } from '../../../core/constants/route-paths';
import { MESSAGE_TYPE, STORAGE_KEY } from '../../../core/enums';
import { UsernamePasswordLoginResponse } from '../../../core/interfaces/user.dtos';
import { PlatformService } from '../../../services/platform.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../services/auth.service';

export interface LoginModel {
  username: string,
  password: string,
  isAcceptedTerm: boolean
}

export const initialData: LoginModel = {
  username: 'admin@admin.com',
  password: 'admin123',
  isAcceptedTerm: true
}

export const loginSchema = schema<LoginModel>((root) => {
  required(root.username, { message: 'user name is required'});
  email(root.username, { message: 'Please enter the valid email address'})
  required(root.password, { message: 'password is required'})
  required(root.isAcceptedTerm, { message: 'Accept term is required'})
})

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    CardModule,
    FocusTrapModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    PasswordModule,
    DividerModule,
    FormField,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected platformService = inject(PlatformService);

  private readonly authService = inject(AuthService);

  protected sessionStorageService = inject(SessionStorageService);

  protected toastService = inject(ToastService);

  protected router = inject(Router);
  
  protected loginFormData = signal<LoginModel>(initialData);

  protected loginForm = form(this.loginFormData, loginSchema);

  protected showPassword = signal<boolean>(false);

  private togglePasswordTimeout?: ReturnType<typeof setTimeout>;

  protected submitButtonSeverity = computed(() =>
    this.loginForm().invalid() ? 'secondary' : 'info'
  );

  protected onSubmit() {
    if (this.loginForm().invalid()) return;

    const payload = this.loginFormData();
    const { username, password } = payload;

    this.login(username, password);
  }

  private login(username: string, password: string) {
    this.authService.login(username, password).subscribe({
      next: (res: UsernamePasswordLoginResponse) => {
      
        this.authService.setAccessToken(res.accessToken);
        const redirectUrl = this.sessionStorageService.getItem(STORAGE_KEY.REDIRECT_URL);

        if (redirectUrl) {
          this.sessionStorageService.removeItem(STORAGE_KEY.REDIRECT_URL);
          this.router.navigateByUrl(redirectUrl);
        } 
        else {
          this.router.navigateByUrl(ROUTE_PATHS.HOME);
        }
      },
      error: err => {
        const toastSummary = 'Login failed';
        const toastDetail = err.error.message;
        console.log('Login error: ', err.error);
        this.toastService.showToast(MESSAGE_TYPE.WARN, toastSummary, toastDetail);
      }
    })
  }

  protected navigateToSignupPage(): void {
    this.router.navigateByUrl(ROUTE_PATHS.SIGNUP)
  }

  protected toggleWithAutoHidePassword() {
    this.showPassword.update(currentStatus => !currentStatus);
    
    if(this.togglePasswordTimeout) {
      clearTimeout(this.togglePasswordTimeout)
    }

    if (this.showPassword()) {
      this.togglePasswordTimeout = setTimeout(() => {
        this.showPassword.update(currentStatus => !currentStatus);
        this.togglePasswordTimeout = undefined;
      }, 1000)
    }
  }
}

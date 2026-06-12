import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { email, form, FormField, required, schema, validate } from '@angular/forms/signals';
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
import { TooltipModule } from 'primeng/tooltip';
import { ROUTE_PATHS } from '../../../core/constants/route-paths';
import { MESSAGE_TYPE } from '../../../core/enums';
import { UsernamePasswordLoginResponse } from '../../../core/interfaces/user.dtos';
import { PlatformService } from '../../../services/platform.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../services/auth.service';
import { VerifyAccountService } from '../services/verify-account.service';
import { LoaderService } from '../../../services/loader.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface SignupModel {
  username: string,
  password: string,
  confirmPassword: string,
  isAcceptedTerm: boolean
}

export const initialData: SignupModel = {
  username: '',
  password: '',
  confirmPassword: '',
  isAcceptedTerm: true
}

export enum PASSWORD_FIELD_TYPE {
  PASSWORD = 'password',
  CONFIRM_PASSWORD = 'confirm_password'
}

export const signupSchema = schema<SignupModel>((root) => {
  required(root.username, {message: 'user name is required', when: context => context.stateOf(root.username).touched()});
  email(root.username, { message: 'Please enter the valid email address'});
  email(root.username, { message: 'Please enter the valid email address'});
  required(root.password, { message: 'password is required', when: context => context.stateOf(root.password).touched() });
  required(root.confirmPassword, { message: 'confirm password is required', when: context => context.stateOf(root.confirmPassword).touched() });
  required(root.isAcceptedTerm, { message: 'Accept term is required', when: context => context.stateOf(root.isAcceptedTerm).touched() });
  validate(root.password, (ctx) => {
    const password = ctx.value();
    const confirmPassword = ctx.valueOf(root.confirmPassword);
    if(password && confirmPassword && password != confirmPassword) {
      return {
        kind: 'password mismatch',
        message: 'password and confirm password are not the same!'
      }
    }
    return null;
  });
  validate(root.confirmPassword, (ctx) => {
    const confirmPassword = ctx.value();
    const password = ctx.valueOf(root.password);
    if(password && confirmPassword && password != confirmPassword) {
      return {
        kind: 'password mismatch',
        message: 'password and confirm password are not the same!'
      }
    }
    return null;
  })
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
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    PasswordModule,
    DividerModule,
    FormField,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  protected platformService = inject(PlatformService);

  private readonly authService = inject(AuthService);

  private readonly verifyAccountService = inject(VerifyAccountService);

  protected sessionStorageService = inject(SessionStorageService);

  protected toastService = inject(ToastService);

  protected router = inject(Router);
  
  protected signupFormData = signal<SignupModel>(initialData);

  protected signupForm = form(this.signupFormData, signupSchema);

  protected showPassword = signal<boolean>(false);

  protected showConfirmPassword = signal<boolean>(false);

  private readonly togglePasswordTimeout?: ReturnType<typeof setTimeout>;

  private readonly toggleConfirmPasswordTimeout?: ReturnType<typeof setTimeout>;

  private readonly destroyRef = inject(DestroyRef);

  private readonly loaderService = inject(LoaderService);

  protected submitButtonSeverity = computed(() =>
    this.signupForm().invalid() || !this.signupFormData().confirmPassword || !this.signupFormData().password || !this.signupFormData().username ? 'secondary' : 'success'
  );


  protected onSubmit() {
    if (this.signupForm().invalid()) return;
    this.signup(this.signupFormData());
  }


  private signup(signupData: SignupModel) {
    this.loaderService.show();
    this.authService.signup(signupData)
    .pipe(
      finalize(() => this.loaderService.hide()),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (res: UsernamePasswordLoginResponse) => {
        const toastSummary = 'Registration successful!';
        const toastDetail = 'We\'ve sent a verification code to your email. Please enter the code to confirm your email address.';
        this.toastService.showToast(MESSAGE_TYPE.SUCCESS, toastSummary, toastDetail);

        this.verifyAccountService.emailToBeVerified = signupData.username;
        this.verifyAccountService.isVerificationCodeSent = true;
        this.navigateToVerifyAccountPage();
      },
      error: err => {
        const toastSummary = 'Sign up failed';
        const toastDetail = err.error.message;
        console.log('Sign up error: ', err);
        
        this.toastService.showToast(
          MESSAGE_TYPE.WARN, toastSummary, 
          toastDetail);
      }
    })
  }


  protected navigateToVerifyAccountPage(): void {
    this.router.navigateByUrl(ROUTE_PATHS.AUTH.children.VERIFY_ACCOUNT.fullPath);
  }


  private toggleWithAutoHide(toggleStatus: WritableSignal<boolean>, timeoutRef?: ReturnType<typeof setTimeout>) {
    toggleStatus.update(currentStatus => !currentStatus);

    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = undefined;
    }

    if (toggleStatus()) {
      timeoutRef = setTimeout(() => {
        toggleStatus.set(false);
        timeoutRef = undefined;
      }, 1000);
    }
  }


  protected togglePassword() {
    this.toggleWithAutoHide(
      this.showPassword, 
      this.togglePasswordTimeout
    );
  }


  protected toggleConfirmPassword() {
    this.toggleWithAutoHide(
      this.showConfirmPassword, 
      this.toggleConfirmPasswordTimeout
    );
  }
}

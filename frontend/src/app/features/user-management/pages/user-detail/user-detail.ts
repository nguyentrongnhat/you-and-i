import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  form,
  FormField,
  maxLength,
  pattern,
  schema,
} from '@angular/forms/signals';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { MESSAGE_TYPE } from '../../../../core/enums';
import { UserDetails } from '../../../../core/interfaces/user.dtos';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../services/user.service';

export interface UserProfileFormModel {
  fullName: string;
  displayName: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  address: string;
  bio: string;
}

const emptyProfileForm: UserProfileFormModel = {
  fullName: '',
  displayName: '',
  phone: '',
  dateOfBirth: null,
  gender: '',
  address: '',
  bio: '',
};

export const userProfileSchema = schema<UserProfileFormModel>((root) => {
  maxLength(root.fullName, 100, { message: 'Họ và tên tối đa 100 ký tự' });
  maxLength(root.displayName, 100, { message: 'Tên hiển thị tối đa 100 ký tự' });
  pattern(root.phone, /^[0-9+\-\s()]*$/, {
    message: 'Số điện thoại không hợp lệ',
  });
  maxLength(root.address, 255, { message: 'Địa chỉ tối đa 255 ký tự' });
  maxLength(root.bio, 500, { message: 'Giới thiệu tối đa 500 ký tự' });
});

@Component({
  selector: 'app-user-detail',
  imports: [
    FormField,
    FormsModule,
    AvatarModule,
    ButtonModule,
    ChipModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
    TagModule,
    TextareaModule,
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail implements OnInit {
  id = input.required<string>();

  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  protected readonly user = signal<UserDetails | undefined>(undefined);
  protected readonly loading = signal<boolean>(true);
  protected readonly notFound = signal<boolean>(false);
  protected readonly saving = signal<boolean>(false);

  protected readonly profile = computed(() => this.user()?.profile);

  protected readonly genderOptions = [
    { label: 'Nam', value: 'MALE' },
    { label: 'Nữ', value: 'FEMALE' },
    { label: 'Khác', value: 'OTHER' },
  ];

  protected readonly formData = signal<UserProfileFormModel>({
    ...emptyProfileForm,
  });

  protected readonly userForm = form(this.formData, userProfileSchema);

  private readonly originalValue = signal<string>(
    this.serialize(emptyProfileForm)
  );

  protected readonly hasChanges = computed<boolean>(
    () => this.serialize(this.formData()) !== this.originalValue()
  );

  protected readonly initials = computed<string>(() => {
    const profile = this.profile();
    const source =
      profile?.fullName || profile?.displayName || this.user()?.username || '';
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  ngOnInit(): void {
    this.getUserDetailsById(this.id());
  }

  private getUserDetailsById(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);

    this.userService.getUserDetailsById(id).subscribe({
      next: (userDetails) => {
        this.user.set(userDetails);
        this.patchForm(userDetails);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
        this.toastService.showToast(
          MESSAGE_TYPE.ERROR,
          'Lỗi',
          'Không thể tải thông tin người dùng.'
        );
      },
    });
  }

  private patchForm(user: UserDetails): void {
    const profile = user.profile;
    const value: UserProfileFormModel = {
      fullName: profile?.fullName ?? '',
      displayName: profile?.displayName ?? '',
      phone: profile?.phone ?? '',
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null,
      gender: profile?.gender ?? '',
      address: profile?.address ?? '',
      bio: profile?.bio ?? '',
    };
    this.formData.set(value);
    this.originalValue.set(this.serialize(value));
  }

  private serialize(value: UserProfileFormModel): string {
    return JSON.stringify({
      ...value,
      dateOfBirth: this.formatDate(value.dateOfBirth),
    });
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected updateField<K extends keyof UserProfileFormModel>(
    key: K,
    value: UserProfileFormModel[K]
  ): void {
    this.formData.update((current) => ({ ...current, [key]: value }));
  }

  protected save(): void {
    if (this.userForm().invalid()) {
      this.toastService.showToast(
        MESSAGE_TYPE.WARN,
        'Thông tin chưa hợp lệ',
        'Vui lòng kiểm tra lại các trường đã nhập.'
      );
      return;
    }

    const current = this.user();
    if (!current) return;

    const value = this.formData();

    const payload: UserDetails = {
      ...current,
      profile: {
        ...current.profile,
        fullName: value.fullName,
        displayName: value.displayName,
        phone: value.phone,
        dateOfBirth: this.formatDate(value.dateOfBirth),
        gender: value.gender,
        address: value.address,
        bio: value.bio,
      },
    };

    this.saving.set(true);
    this.userService.updateUserData(payload).subscribe({
      next: () => {
        this.user.set(payload);
        this.patchForm(payload);
        this.authService.refreshToken().subscribe();
        this.saving.set(false);
        this.toastService.showToast(
          MESSAGE_TYPE.SUCCESS,
          'Thành công',
          'Đã cập nhật thông tin người dùng.'
        );
      },
      error: () => {
        this.saving.set(false);
        this.toastService.showToast(
          MESSAGE_TYPE.ERROR,
          'Lỗi',
          'Không thể cập nhật thông tin người dùng.'
        );
      },
    });
  }

  protected reload(): void {
    this.getUserDetailsById(this.id());
  }
}

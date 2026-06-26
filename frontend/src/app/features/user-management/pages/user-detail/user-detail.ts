import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
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
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { MESSAGE_TYPE, ROLE } from '../../../../core/enums';
import { UserDetails } from '../../../../core/interfaces/user.dtos';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../services/user.service';
import { finalize } from 'rxjs';
import { LoaderService } from '../../../../services/loader.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoleService } from '../../services/role.service';

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
		KeyFilterModule,
		MultiSelectModule,
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
	private readonly roleService = inject(RoleService);
	private readonly toastService = inject(ToastService);
	private readonly authService = inject(AuthService);
	private readonly destroyRef = inject(DestroyRef);

	protected readonly user = signal<UserDetails | undefined>(undefined);
	protected loaderService = inject(LoaderService);
	protected readonly notFound = signal<boolean>(false);
	protected readonly saving = signal<boolean>(false);
	protected readonly savingRoles = signal<boolean>(false);

	protected readonly profile = computed(() => this.user()?.profile);

	protected readonly genderOptions = [
		{ label: 'Nam', value: 'MALE' },
		{ label: 'Nữ', value: 'FEMALE' },
		{ label: 'Khác', value: 'OTHER' },
	];

	/** Only super admins / admins may edit a user's roles. */
	protected readonly canEditRoles = computed<boolean>(() =>
		this.userService.hasRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN], 'OR')
	);

	/** The logged-in user (editor) is a super admin. */
	private readonly editorIsSuperAdmin = computed<boolean>(() =>
		this.userService.hasRoles([ROLE.SUPER_ADMIN], 'OR')
	);

	protected readonly roleOptions = computed(() => {
		const targetRoles = this.user()?.roles ?? [];
		const editorIsSuper = this.editorIsSuperAdmin();
		return (this.roleService.roles() ?? []).map((role) => ({
			label: this.roleLabel(role),
			value: role,
			disabled: this.isRoleLocked(role, targetRoles, editorIsSuper),
		}));
	});

	protected readonly selectedRoles = signal<string[]>([]);

	private readonly originalRoles = signal<string>('[]');

	protected readonly rolesChanged = computed<boolean>(
		() => this.serializeRoles(this.selectedRoles()) !== this.originalRoles()
	);

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
		return this.userService.extractAvatarFromName(source);
	});

	ngOnInit(): void {
		this.getUserDetailsById(this.id());
		this.roleService.getAllRoles().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loaderService.hide())).subscribe({
			next: (roles) => {
				console.log('Roles fetched:', roles); // Roles are fetched and cached in the service, no further action needed here
			}
		});
	}

	private getUserDetailsById(id: string): void {
		this.loaderService.show();
		this.notFound.set(false);

		this.userService.getUserDetailsById(id)
		.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loaderService.hide()))
		.subscribe({
			next: (userDetails) => {
				this.user.set(userDetails);
				this.patchForm(userDetails);
			},
			error: (err) => {
				this.notFound.set(true);
				this.toastService.showToast(
					MESSAGE_TYPE.ERROR,
					'Error',
					err.error.message || 'Unable to load user information.'
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

		const roles = [...(user.roles ?? [])];
		this.selectedRoles.set(roles);
		this.originalRoles.set(this.serializeRoles(roles));
	}

	private serializeRoles(roles: string[]): string {
		return JSON.stringify([...roles].sort());
	}

	protected roleLabel(role: string): string {
		return role
			.replace(/^ROLE_/, '')
			.split('_')
			.filter(Boolean)
			.map((part) => part.charAt(0) + part.slice(1).toLowerCase())
			.join(' ');
	}

	/**
	 * Determines whether a role is protected from being changed in the UI.
	 * - The SUPER_ADMIN role can never be edited by anyone (added or removed).
	 * - A plain admin cannot remove the ADMIN role (own or anyone else's);
	 *   only a super admin may remove an ADMIN role.
	 */
	private isRoleLocked(
		role: string,
		targetRoles: string[],
		editorIsSuper: boolean
	): boolean {
		// SUPER_ADMIN is immutable for every user, regardless of context.
		if (role === ROLE.SUPER_ADMIN) {
			return true;
		}

		if (!targetRoles.includes(role)) return false;

		if (role === ROLE.ADMIN) {
			return !editorIsSuper;
		}

		return false;
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

		this.loaderService.show();
		this.saving.set(true);
		this.userService.updateUserData(payload).pipe(
			finalize(() => this.loaderService.hide()),
			takeUntilDestroyed(this.destroyRef)
		).subscribe({
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

	protected saveRoles(): void {
		if (!this.canEditRoles()) return;

		const current = this.user();
		if (!current) return;

		const roles = this.selectedRoles();
		if (roles.length === 0) {
			this.toastService.showToast(
				MESSAGE_TYPE.WARN,
				'Thiếu vai trò',
				'Người dùng phải có ít nhất một vai trò.'
			);
			return;
		}

		const targetRoles = current.roles ?? [];
		const editorIsSuper = this.editorIsSuperAdmin();
		const removedProtected = targetRoles.some(
			(role) =>
				this.isRoleLocked(role, targetRoles, editorIsSuper) &&
				!roles.includes(role)
		);
		if (removedProtected) {
			this.toastService.showToast(
				MESSAGE_TYPE.WARN,
				'Không được phép',
				'Bạn không thể gỡ bỏ vai trò được bảo vệ này.'
			);
			return;
		}

		const payload: UserDetails = { ...current, roles: [...roles] };

		this.loaderService.show();
		this.savingRoles.set(true);
		this.userService
			.updateUserData(payload)
			.pipe(
				finalize(() => this.loaderService.hide()),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe({
				next: () => {
					this.user.set(payload);
					this.selectedRoles.set([...roles]);
					this.originalRoles.set(this.serializeRoles(roles));
					this.savingRoles.set(false);
					this.toastService.showToast(
						MESSAGE_TYPE.SUCCESS,
						'Thành công',
						'Đã cập nhật vai trò người dùng.'
					);
				},
				error: () => {
					this.savingRoles.set(false);
					this.toastService.showToast(
						MESSAGE_TYPE.ERROR,
						'Lỗi',
						'Không thể cập nhật vai trò người dùng.'
					);
				},
			});
	}
}

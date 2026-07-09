import {
	Component,
	DestroyRef,
	effect,
	inject,
	input,
	signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MESSAGE_TYPE } from '../../../../core/enums';
import {
	CreateRelationshipRequest,
	Relationship,
	RelationshipMember,
	RELATIONSHIP_ROLE,
	RELATIONSHIP_STATUS,
	RELATIONSHIP_TYPE,
	UpdateRelationshipRequest,
} from '../../../../core/interfaces/relationship.dtos';
import { ToastService } from '../../../../services/toast.service';
import { RelationshipService } from '../../services/relationship.service';
import { MemberRoleChange, RelationshipCard } from '../relationship-card/relationship-card';

@Component({
	selector: 'app-relationship-panel',
	imports: [
		FormsModule,
		ButtonModule,
		DatePickerModule,
		DialogModule,
		InputTextModule,
		SelectModule,
		SkeletonModule,
		TextareaModule,
		RelationshipCard,
	],
	templateUrl: './relationship-panel.html',
	styleUrl: './relationship-panel.scss',
})
export class RelationshipPanel {
	/** The user whose relationships are being managed. */
	readonly userId = input.required<string>();

	private readonly relationshipService = inject(RelationshipService);
	private readonly toastService = inject(ToastService);
	private readonly destroyRef = inject(DestroyRef);

	protected readonly RELATIONSHIP_ROLE = RELATIONSHIP_ROLE;

	protected readonly relationships = signal<Relationship[]>([]);
	protected readonly loading = signal<boolean>(false);
	protected readonly saving = signal<boolean>(false);

	protected readonly typeOptions = [
		{ label: 'Cặp đôi', value: RELATIONSHIP_TYPE.COUPLE, icon: 'pi pi-heart' },
		{ label: 'Bạn bè', value: RELATIONSHIP_TYPE.FRIENDSHIP, icon: 'pi pi-users' },
		{ label: 'Gia đình', value: RELATIONSHIP_TYPE.FAMILY, icon: 'pi pi-home' },
		{ label: 'Đồng nghiệp', value: RELATIONSHIP_TYPE.COLLEAGUE, icon: 'pi pi-briefcase' },
	];

	protected readonly statusOptions = [
		{ label: 'Chờ duyệt', value: RELATIONSHIP_STATUS.PENDING },
		{ label: 'Đang hoạt động', value: RELATIONSHIP_STATUS.ACTIVE },
		{ label: 'Tạm dừng', value: RELATIONSHIP_STATUS.PAUSED },
		{ label: 'Đã kết thúc', value: RELATIONSHIP_STATUS.ENDED },
	];

	protected readonly memberRoleOptions = [
		{ label: 'Quản trị', value: RELATIONSHIP_ROLE.ADMIN },
		{ label: 'Thành viên', value: RELATIONSHIP_ROLE.MEMBER },
		{ label: 'Người xem', value: RELATIONSHIP_ROLE.VIEWER },
	];

	// Relationship dialog state
	protected readonly showRelDialog = signal<boolean>(false);
	protected readonly editingRelId = signal<string | null>(null);
	protected readonly relType = signal<RELATIONSHIP_TYPE>(RELATIONSHIP_TYPE.FRIENDSHIP);
	protected readonly relStatus = signal<RELATIONSHIP_STATUS>(RELATIONSHIP_STATUS.ACTIVE);
	protected readonly relDescription = signal<string>('');
	protected readonly relStartAt = signal<Date | null>(null);

	// Member dialog state
	protected readonly showMemberDialog = signal<boolean>(false);
	protected readonly memberTargetRelId = signal<string | null>(null);
	protected readonly memberUserId = signal<string>('');
	protected readonly memberRole = signal<RELATIONSHIP_ROLE>(RELATIONSHIP_ROLE.MEMBER);

	// Delete confirmation state
	protected readonly confirmDeleteRelId = signal<string | null>(null);

	constructor() {
		effect(() => {
			const id = this.userId();
			if (id) this.loadRelationships(id);
		});
	}

	private loadRelationships(userId: string): void {
		this.loading.set(true);
		this.relationshipService
			.getRelationshipsByUserId(userId)
			.pipe(
				finalize(() => this.loading.set(false)),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe({
				next: (relationships) => this.relationships.set(relationships ?? []),
				error: () => {
					this.relationships.set([]);
					this.toastService.showToast(
						MESSAGE_TYPE.ERROR,
						'Lỗi',
						'Không thể tải danh sách mối quan hệ.'
					);
				},
			});
	}

	private reload(): void {
		this.loadRelationships(this.userId());
	}

	// ── Create / edit relationship ──────────────────────────────────────────────

	protected openCreateRelationship(): void {
		this.editingRelId.set(null);
		this.relType.set(RELATIONSHIP_TYPE.FRIENDSHIP);
		this.relStatus.set(RELATIONSHIP_STATUS.ACTIVE);
		this.relDescription.set('');
		this.relStartAt.set(new Date());
		this.showRelDialog.set(true);
	}

	protected openEditRelationship(rel: Relationship): void {
		this.editingRelId.set(rel.id);
		this.relType.set(rel.type);
		this.relStatus.set(rel.status);
		this.relDescription.set(rel.description ?? '');
		this.relStartAt.set(rel.startAt ? new Date(rel.startAt) : null);
		this.showRelDialog.set(true);
	}

	protected closeRelationshipDialog(): void {
		this.showRelDialog.set(false);
	}

	protected saveRelationship(): void {
		const editingId = this.editingRelId();
		this.saving.set(true);

		if (editingId) {
			const payload: UpdateRelationshipRequest = {
				type: this.relType(),
				status: this.relStatus(),
				description: this.relDescription().trim(),
				startAt: this.relStartAt()?.toISOString(),
			};
			this.relationshipService
				.updateRelationship(editingId, payload)
				.pipe(
					finalize(() => this.saving.set(false)),
					takeUntilDestroyed(this.destroyRef)
				)
				.subscribe({
					next: () => this.onRelationshipSaved('Đã cập nhật mối quan hệ.'),
					error: () => this.onRelationshipError(),
				});
			return;
		}

		const payload: CreateRelationshipRequest = {
			type: this.relType(),
			description: this.relDescription().trim(),
			startAt: this.relStartAt()?.toISOString(),
		};
		const targetUserId = this.userId();

		this.relationshipService
			.createRelationship(payload)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (created) => {
					// Automatically attach the target user as a member of the new relationship.
					if (targetUserId && created?.id) {
						this.relationshipService
							.addMember(created.id, {
								userId: targetUserId,
								role: RELATIONSHIP_ROLE.MEMBER,
							})
							.pipe(
								finalize(() => this.saving.set(false)),
								takeUntilDestroyed(this.destroyRef)
							)
							.subscribe({
								next: () => this.onRelationshipSaved('Đã tạo mối quan hệ.'),
								error: () => this.onRelationshipSaved('Đã tạo mối quan hệ.'),
							});
					} else {
						this.saving.set(false);
						this.onRelationshipSaved('Đã tạo mối quan hệ.');
					}
				},
				error: () => {
					this.saving.set(false);
					this.onRelationshipError();
				},
			});
	}

	private onRelationshipSaved(message: string): void {
		this.showRelDialog.set(false);
		this.reload();
		this.toastService.showToast(MESSAGE_TYPE.SUCCESS, 'Thành công', message);
	}

	private onRelationshipError(): void {
		this.toastService.showToast(
			MESSAGE_TYPE.ERROR,
			'Lỗi',
			'Không thể lưu mối quan hệ.'
		);
	}

	// ── Delete relationship ─────────────────────────────────────────────────────

	protected requestDeleteRelationship(rel: Relationship): void {
		this.confirmDeleteRelId.set(rel.id);
	}

	protected cancelDeleteRelationship(): void {
		this.confirmDeleteRelId.set(null);
	}

	protected confirmDeleteRelationship(): void {
		const id = this.confirmDeleteRelId();
		if (!id) return;

		this.relationshipService
			.deleteRelationship(id)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.confirmDeleteRelId.set(null);
					this.reload();
					this.toastService.showToast(
						MESSAGE_TYPE.SUCCESS,
						'Thành công',
						'Đã xoá mối quan hệ.'
					);
				},
				error: () => {
					this.confirmDeleteRelId.set(null);
					this.toastService.showToast(
						MESSAGE_TYPE.ERROR,
						'Lỗi',
						'Không thể xoá mối quan hệ.'
					);
				},
			});
	}

	// ── Members: add / update role / remove ─────────────────────────────────────

	protected openAddMember(rel: Relationship): void {
		this.memberTargetRelId.set(rel.id);
		this.memberUserId.set('');
		this.memberRole.set(RELATIONSHIP_ROLE.MEMBER);
		this.showMemberDialog.set(true);
	}

	protected closeMemberDialog(): void {
		this.showMemberDialog.set(false);
	}

	protected addMember(): void {
		const relId = this.memberTargetRelId();
		const userId = this.memberUserId().trim();
		if (!relId) return;

		if (!userId) {
			this.toastService.showToast(
				MESSAGE_TYPE.WARN,
				'Thiếu thông tin',
				'Vui lòng nhập ID người dùng cần thêm.'
			);
			return;
		}

		this.saving.set(true);
		this.relationshipService
			.addMember(relId, { userId, role: this.memberRole() })
			.pipe(
				finalize(() => this.saving.set(false)),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe({
				next: () => {
					this.showMemberDialog.set(false);
					this.reload();
					this.toastService.showToast(
						MESSAGE_TYPE.SUCCESS,
						'Thành công',
						'Đã thêm thành viên.'
					);
				},
				error: (err) => {
					this.toastService.showToast(
						MESSAGE_TYPE.ERROR,
						'Lỗi',
						err?.error?.message || 'Không thể thêm thành viên.'
					);
				},
			});
	}

	protected changeMemberRole(rel: Relationship, change: MemberRoleChange): void {
		this.relationshipService
			.updateMemberRole(rel.id, change.member.id, { role: change.role })
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.reload();
					this.toastService.showToast(
						MESSAGE_TYPE.SUCCESS,
						'Thành công',
						'Đã cập nhật vai trò thành viên.'
					);
				},
				error: (err) => {
					this.toastService.showToast(
						MESSAGE_TYPE.ERROR,
						'Lỗi',
						err?.error?.message || 'Không thể cập nhật vai trò.'
					);
				},
			});
	}

	protected removeMember(rel: Relationship, member: RelationshipMember): void {
		this.relationshipService
			.removeMember(rel.id, member.id)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.reload();
					this.toastService.showToast(
						MESSAGE_TYPE.SUCCESS,
						'Thành công',
						'Đã gỡ thành viên.'
					);
				},
				error: (err) => {
					this.toastService.showToast(
						MESSAGE_TYPE.ERROR,
						'Lỗi',
						err?.error?.message || 'Không thể gỡ thành viên.'
					);
				},
			});
	}
}

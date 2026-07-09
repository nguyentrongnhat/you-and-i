import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import {
	Relationship,
	RelationshipMember,
	RELATIONSHIP_ROLE,
	RELATIONSHIP_STATUS,
	RELATIONSHIP_TYPE,
} from '../../../../core/interfaces/relationship.dtos';
import { UserService } from '../../services/user.service';

export interface MemberRoleChange {
	member: RelationshipMember;
	role: RELATIONSHIP_ROLE;
}

interface SelectOption<T> {
	label: string;
	value: T;
	icon?: string;
}

@Component({
	selector: 'app-relationship-card',
	imports: [FormsModule, AvatarModule, ButtonModule, SelectModule, TagModule],
	templateUrl: './relationship-card.html',
	styleUrl: './relationship-card.scss',
})
export class RelationshipCard {
	readonly relationship = input.required<Relationship>();
	readonly memberRoleOptions = input.required<SelectOption<RELATIONSHIP_ROLE>[]>();
	readonly typeOptions = input.required<SelectOption<RELATIONSHIP_TYPE>[]>();
	readonly statusOptions = input.required<SelectOption<RELATIONSHIP_STATUS>[]>();

	readonly edit = output<void>();
	readonly remove = output<void>();
	readonly addMember = output<void>();
	readonly changeRole = output<MemberRoleChange>();
	readonly removeMember = output<RelationshipMember>();

	protected readonly RELATIONSHIP_ROLE = RELATIONSHIP_ROLE;

	constructor(private readonly userService: UserService) {}

	protected typeLabel(type: RELATIONSHIP_TYPE): string {
		return this.typeOptions().find((o) => o.value === type)?.label ?? type;
	}

	protected typeIcon(type: RELATIONSHIP_TYPE): string {
		return this.typeOptions().find((o) => o.value === type)?.icon ?? 'pi pi-link';
	}

	protected statusLabel(status: RELATIONSHIP_STATUS): string {
		return this.statusOptions().find((o) => o.value === status)?.label ?? status;
	}

	protected statusSeverity(
		status: RELATIONSHIP_STATUS
	): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
		switch (status) {
			case RELATIONSHIP_STATUS.ACTIVE:
				return 'success';
			case RELATIONSHIP_STATUS.PENDING:
				return 'warn';
			case RELATIONSHIP_STATUS.PAUSED:
				return 'info';
			case RELATIONSHIP_STATUS.ENDED:
				return 'danger';
			default:
				return 'secondary';
		}
	}

	protected memberRoleLabel(role: RELATIONSHIP_ROLE): string {
		switch (role) {
			case RELATIONSHIP_ROLE.OWNER:
				return 'Chủ sở hữu';
			case RELATIONSHIP_ROLE.ADMIN:
				return 'Quản trị';
			case RELATIONSHIP_ROLE.MEMBER:
				return 'Thành viên';
			case RELATIONSHIP_ROLE.VIEWER:
				return 'Người xem';
			default:
				return role;
		}
	}

	protected memberRoleSeverity(
		role: RELATIONSHIP_ROLE
	): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
		switch (role) {
			case RELATIONSHIP_ROLE.OWNER:
				return 'danger';
			case RELATIONSHIP_ROLE.ADMIN:
				return 'warn';
			case RELATIONSHIP_ROLE.MEMBER:
				return 'info';
			default:
				return 'secondary';
		}
	}

	protected memberInitials(member: RelationshipMember): string {
		const source = member.displayName || member.username || '';
		return this.userService.extractAvatarFromName(source);
	}

	protected onChangeRole(member: RelationshipMember, role: RELATIONSHIP_ROLE): void {
		if (member.role === role) return;
		this.changeRole.emit({ member, role });
	}
}

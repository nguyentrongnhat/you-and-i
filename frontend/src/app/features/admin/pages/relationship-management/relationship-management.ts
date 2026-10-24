import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { MESSAGE_TYPE } from '../../../../core/enums';
import {
  Relationship,
  RelationshipMember,
  RelationshipStatus,
  RelationshipType,
} from '../../../../core/interfaces/relationship.dto';
import { LoaderService } from '../../../../services/loader.service';
import { NavigationService } from '../../../../services/navigation.service';
import { ToastService } from '../../../../services/toast.service';
import { RelationshipService } from '../../services/relationship.service';

interface RelationshipTypeMeta {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-relationship-management',
  imports: [DatePipe, DataView, ButtonModule, Tag, DialogModule, Avatar, AvatarGroup, Skeleton, Tooltip],
  templateUrl: './relationship-management.html',
  styleUrl: './relationship-management.scss',
})
export class RelationshipManagement implements OnInit {
  protected relationshipService = inject(RelationshipService);

  protected loaderService = inject(LoaderService);

  protected navigationService = inject(NavigationService);

  protected toastService = inject(ToastService);

  protected allRelationships = signal<Relationship[]>([]);

  protected displayConfirmDeleteDialog = signal(false);

  protected relationshipIdToDelete = signal<string | null>(null);

  // Thêm mới: phục vụ hiển thị
  protected isLoading = signal(true);

  protected deleteTargetName = signal('');

  protected readonly Status = RelationshipStatus;

  protected readonly maxAvatars = 4;

  protected readonly typeList: RelationshipType[] = [
    RelationshipType.ROMANTIC,
    RelationshipType.FAMILY,
    RelationshipType.FRIENDSHIP,
    RelationshipType.GROUP,
  ];

  protected readonly typeMeta: Record<RelationshipType, RelationshipTypeMeta> = {
    [RelationshipType.ROMANTIC]: { label: 'Tình yêu', icon: 'pi-heart' },
    [RelationshipType.FAMILY]: { label: 'Gia đình', icon: 'pi-home' },
    [RelationshipType.FRIENDSHIP]: { label: 'Bạn bè', icon: 'pi-face-smile' },
    [RelationshipType.GROUP]: { label: 'Nhóm', icon: 'pi-users' },
  };

  ngOnInit(): void {
    this.relationshipService
      .getAllRelationships()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((relationships) => {
        this.allRelationships.set(relationships);
      });
  }

  protected getTypeMeta(type: RelationshipType): RelationshipTypeMeta {
    return this.typeMeta[type];
  }

  // GIẢ ĐỊNH: UserDetails có field fullName. Nếu khác, chỉ cần sửa đúng dòng return này.
  protected memberName(member: RelationshipMember): string {
    return member.user.profile.displayName ?? '';
  }

  // Tên Việt Nam: lấy chữ cái đầu của tên gọi (từ cuối)
  protected memberInitial(member: RelationshipMember): string {
    const words = this.memberName(member).trim().split(/\s+/);
    return (words[words.length - 1]?.charAt(0) ?? '').toUpperCase() || '?';
  }

  protected navigateToRelationshipDetail(id: string): void {
    this.navigationService.goToRelationshipDetail(id);
  }

  protected navigateToCreateRelationship(): void {
    this.navigationService.goToCreateRelationship();
  }

  protected deleteRelationship(): void {
    const id = this.relationshipIdToDelete();
    if (!id) return;

    this.loaderService.show();
    this.relationshipService
      .deleteRelationship(id)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe(() => {
        this.allRelationships.set(
          this.allRelationships().filter((relationship) => relationship.id !== id),
        );
        this.toastService.showToast(MESSAGE_TYPE.SUCCESS, 'Deleted', 'Relationship deleted successfully');
        this.displayConfirmDeleteDialog.set(false);
        this.relationshipIdToDelete.set(null);
      });
  }

  protected confirmDeleteRelationship(id: string): void {
    const target = this.allRelationships().find((relationship) => relationship.id === id);
    this.deleteTargetName.set(target?.name ?? '');
    this.relationshipIdToDelete.set(id);
    this.displayConfirmDeleteDialog.set(true);
  }

  protected cancelDeleteRelationship(): void {
    this.displayConfirmDeleteDialog.set(false);
    this.relationshipIdToDelete.set(null);
  }
}
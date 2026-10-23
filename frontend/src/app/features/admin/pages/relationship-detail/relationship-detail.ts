import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormField,
  form,
  maxLength,
  required,
  schema,
} from '@angular/forms/signals';
import { finalize } from 'rxjs';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';

import {
  Relationship,
  RelationshipMember,
  RelationshipStatus,
  RelationshipType,
} from '../../../../core/interfaces/relationship.dto';
import { UserDetails } from '../../../../core/interfaces/user.dtos';
import { RelationshipService } from '../../services/relationship.service';
import { LoaderService } from '../../../../services/loader.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../../../services/toast.service';
import { MESSAGE_TYPE } from '../../../../core/enums';
import { NavigationService } from '../../../../services/navigation.service';

interface RelationshipFormModel {
  name: string;
  active: boolean;
  type: RelationshipType;
  status: RelationshipStatus;
  startAt: Date | null;
}

interface AddMemberFormModel {
  userId: string;
  active: boolean;
}

interface RelationshipTypeOption {
  label: string;
  value: RelationshipType;
  icon: string;
  tone: 'friendship' | 'romantic' | 'family' | 'group';
}

/**
 * SSR note: the default start date must NOT be created here with new Date().
 * The server and the browser would produce different values and cause
 * hydration mismatches. The browser sets it in afterNextRender() instead.
 */
const createEmptyRelationshipForm = (
  startAt: Date | null = null,
): RelationshipFormModel => ({
  name: '',
  active: true,
  type: RelationshipType.FRIENDSHIP,
  status: RelationshipStatus.ACTIVE,
  startAt,
});

const createEmptyAddMemberForm = (): AddMemberFormModel => ({
  userId: '',
  active: true,
});

export const relationshipSchema = schema<RelationshipFormModel>((root) => {
  required(root.name, {
    message: 'Relationship name is required.',
  });

  maxLength(root.name, 100, {
    message: 'Relationship name must not exceed 100 characters.',
  });

  required(root.type, {
    message: 'Please select a relationship type.',
  });

  required(root.status, {
    message: 'Please select a relationship status.',
  });

  required(root.startAt, {
    message: 'Please select a start date.',
  });
});

export const addMemberSchema = schema<AddMemberFormModel>((root) => {
  required(root.userId, {
    message: 'Please select a user.',
  });
});

@Component({
  selector: 'app-relationship-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    FormField,
    AvatarModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ToggleSwitchModule,
    TooltipModule,
  ],
  templateUrl: './relationship-detail.html',
  styleUrl: './relationship-detail.scss',
})
export class RelationshipDetail implements OnInit, AfterViewInit {
  readonly id = input.required<string>();
  readonly mode = input.required<string>();

  private readonly relationshipService = inject(RelationshipService);
  private readonly navigationService = inject(NavigationService);
  private readonly loaderService = inject(LoaderService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly relationship = signal<Relationship | null>(null);

  protected readonly isSaving = signal(false);

  /**
   * False on the server and during hydration, true after the first browser render.
   * Used to render the PrimeNG datepicker only in the browser.
   */
  protected readonly isBrowser = signal(false);

  protected readonly showAddMemberDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly duplicateMember = signal(false);

  protected readonly members = signal<RelationshipMember[]>([]);

  protected readonly availableUsers = computed(() => {
    const memberIds = new Set(
      this.members().map((member) => member.user.id),
    );

    return this.userService
      .allUsers()
      .filter((user) => !memberIds.has(user.id));
  });

  protected readonly typeOptions: readonly RelationshipTypeOption[] = [
    {
      label: 'Friendship',
      value: RelationshipType.FRIENDSHIP,
      icon: 'pi pi-users',
      tone: 'friendship',
    },
    {
      label: 'Romantic',
      value: RelationshipType.ROMANTIC,
      icon: 'pi pi-heart',
      tone: 'romantic',
    },
    {
      label: 'Family',
      value: RelationshipType.FAMILY,
      icon: 'pi pi-home',
      tone: 'family',
    },
    {
      label: 'Group',
      value: RelationshipType.GROUP,
      icon: 'pi pi-sitemap',
      tone: 'group',
    },
  ];

  protected readonly relationshipStatuses = [
    {
      label: 'Active',
      value: RelationshipStatus.ACTIVE,
    },
    {
      label: 'Inactive',
      value: RelationshipStatus.INACTIVE,
    },
  ];

  protected readonly isEditMode = computed(
    () => this.mode().toLowerCase() === 'edit',
  );

  protected readonly formData = signal<RelationshipFormModel>(
    createEmptyRelationshipForm(),
  );

  protected readonly relationshipForm = form(
    this.formData,
    relationshipSchema,
  );

  protected readonly addMemberFormData = signal<AddMemberFormModel>(
    createEmptyAddMemberForm(),
  );

  protected readonly addMemberForm = form(
    this.addMemberFormData,
    addMemberSchema,
  );

  /** Icon, label and colour tone of the selected relationship type. */
  protected readonly typeMeta = computed(
    () =>
      this.typeOptions.find(
        (option) => option.value === this.formData().type,
      ) ?? this.typeOptions[0],
  );

  protected readonly isActiveStatus = computed(
    () => this.formData().status === RelationshipStatus.ACTIVE,
  );

  /**
   * Snapshot used to restore the original members when Cancel is clicked.
   */
  private initialMembers: RelationshipMember[] = [];

  constructor() {
    /**
     * Browser only. Runs after the first render, never on the server,
     * so the server HTML and the hydrated HTML stay identical.
     */
    afterNextRender(() => {
      this.isBrowser.set(true);

      if (!this.isEditMode() && !this.formData().startAt) {
        this.formData.update((current) => ({
          ...current,
          startAt: new Date(),
        }));
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isEditMode()) {
      this.loaderService.hide();
    }
  }

  ngOnInit(): void {
    if (this.isEditMode()) {
      this.getRelationshipById(this.id());
    } else {
      this.formData.set(createEmptyRelationshipForm());
      this.members.set([]);
      this.initialMembers = [];
    }
  }

  private getRelationshipById(id: string): void {
    this.relationshipService
      .getRelationshipById(id)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe((relationship) => {
        if (relationship) {
          this.relationship.set(relationship);
          this.patchForm(relationship);
        }
      });
  }

  private patchForm(relationship: Relationship): void {
    this.formData.set({
      name: relationship.name ?? '',
      active: relationship.active,
      type: relationship.type,
      status: relationship.status,
      startAt: relationship.startAt ? new Date(relationship.startAt) : null,
    });

    this.members.set(
      this.cloneMembers(relationship.members ?? []),
    );

    this.initialMembers = this.cloneMembers(this.members());
  }

  private cloneMembers(
    members: RelationshipMember[],
  ): RelationshipMember[] {
    return members.map((member) => ({
      ...member,
      user: {
        ...member.user,
        profile: member.user.profile
          ? { ...member.user.profile }
          : member.user.profile,
        roles: [...(member.user.roles ?? [])],
      },
    }));
  }

  protected updateField<K extends keyof RelationshipFormModel>(
    key: K,
    value: RelationshipFormModel[K],
  ): void {
    this.formData.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  protected updateAddMemberField<
    K extends keyof AddMemberFormModel,
  >(
    key: K,
    value: AddMemberFormModel[K],
  ): void {
    this.addMemberFormData.update((current) => ({
      ...current,
      [key]: value,
    }));

    if (key === 'userId') {
      this.duplicateMember.set(false);
    }
  }

  private toLocalDateTimeString(date: Date): string {
    const pad = (value: number): string =>
      value.toString().padStart(2, '0');

    return [
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    ].join('T');
  }

  protected saveRelationship(): void {
    if (this.relationshipForm().invalid() || this.isSaving()) {
      return;
    }

    const current = this.relationship();
    const value = this.formData();

    const request: Relationship = {
      id: current?.id ?? null,
      name: value.name.trim(),
      active: value.active,
      type: value.type,
      status: value.status,
      startAt: value.startAt ? this.toLocalDateTimeString(value.startAt) : null,
      members: this.members(),
    };

    if (this.isEditMode()) {
      this.updateRelationship(request);
    } else {
      this.createRelationship(request);
    }
  }

  private createRelationship(request: Relationship): void {
    this.loaderService.show();
    this.relationshipService.createRelationship(request).pipe(
      finalize(() => this.loaderService.hide())
    ).subscribe({
      next: (relationship) => {
        this.navigationService.goToRelationshipDetail(relationship.id!);
        this.toastService.showToast(MESSAGE_TYPE.SUCCESS, 'Created', 'Relationship created successfully.');
      },
      error: (error) => {
        console.error('Failed to create relationship:', error);
        this.toastService.showToast(MESSAGE_TYPE.ERROR, 'Create Failed', 'Failed to create relationship.');
      }
    });
  }

  private updateRelationship(request: Relationship): void {
    this.loaderService.show();
    this.relationshipService.updateRelationship(request).pipe(
      finalize(() => this.loaderService.hide())
    ).subscribe({
      next: (relationship) => {
        this.patchForm(relationship);
        this.toastService.showToast(MESSAGE_TYPE.SUCCESS, 'Updated', 'Relationship updated successfully.');
      },
      error: (error) => {
        console.error('Failed to update relationship:', error);
        this.toastService.showToast(MESSAGE_TYPE.ERROR, 'Update Failed', 'Failed to update relationship.');
      }
    });
  }

  protected cancel(): void {
    const current = this.relationship();

    if (current) {
      this.patchForm({
        ...current,
        members: this.cloneMembers(this.initialMembers),
      });
    } else {
      // Click handler, so this only ever runs in the browser.
      this.formData.set(createEmptyRelationshipForm(new Date()));
      this.members.set([]);
      this.initialMembers = [];
    }

    this.relationshipForm().reset();

    this.addMemberFormData.set(
      createEmptyAddMemberForm(),
    );

    this.duplicateMember.set(false);
    this.showAddMemberDialog.set(false);
  }

  protected openDeleteDialog(): void {
    this.showDeleteDialog.set(true);
  }

  protected confirmDeleteRelationship(): void {
    const id = this.relationship()?.id;
    this.showDeleteDialog.set(false);

    if (id) {
      this.relationshipService.deleteRelationship(id).pipe(
        finalize(() => this.loaderService.hide())
      ).subscribe({
        next: () => {
          this.toastService.showToast(MESSAGE_TYPE.SUCCESS, 'Deleted', 'Relationship deleted successfully.');
          this.navigationService.goToManagement({
            queryParams: { tab: 'relationships' },
            queryParamsHandling: 'merge',
          });
        },
        error: (error) => {
          console.error('Failed to delete relationship:', error);
          this.toastService.showToast(MESSAGE_TYPE.ERROR, 'Delete Failed', 'Failed to delete relationship.');
        }
      });
    }
  }

  protected openAddMemberDialog(): void {
    this.addMemberFormData.set(
      createEmptyAddMemberForm(),
    );

    this.addMemberForm().reset();

    this.duplicateMember.set(false);
    this.showAddMemberDialog.set(true);

    /**
     * Load all users only when the global cache is empty.
     *
     * UserService owns the user cache, while this component
     * only consumes it through availableUsers().
     */
    if (this.userService.allUsers().length === 0) {
      this.userService.getAllUsers().subscribe();
    }
  }

  protected saveNewMember(): void {
    if (this.addMemberForm().invalid()) {
      return;
    }

    const { userId, active } = this.addMemberFormData();

    const user = this.availableUsers().find(
      ({ id }) => id === userId,
    );

    if (!user) {
      return;
    }

    if (
      this.members().some(
        ({ user: memberUser }) => memberUser.id === userId,
      )
    ) {
      this.duplicateMember.set(true);
      return;
    }

    this.members.update((members) => [
      ...members,
      {
        id: null,
        active,
        user,
      },
    ]);

    this.showAddMemberDialog.set(false);
  }

  protected toggleMember(
    member: RelationshipMember,
    active: boolean,
  ): void {
    this.members.update((members) =>
      members.map((item) =>
        item.user.id === member.user.id
          ? { ...item, active }
          : item,
      ),
    );
  }

  protected removeMember(member: RelationshipMember): void {
    this.members.update((members) =>
      members.filter(
        (item) => item.user.id !== member.user.id,
      ),
    );
  }

  protected getMemberName(
    member: RelationshipMember,
  ): string {
    return (
      member.user?.profile?.displayName ||
      member.user?.profile?.fullName ||
      member.user?.username ||
      'Unknown User'
    );
  }

  protected getMemberInitial(
    member: RelationshipMember,
  ): string {
    return this.getMemberName(member)
      .charAt(0)
      .toUpperCase();
  }

  /**
   * Stable hue (0-359) derived from the member name, so every avatar
   * without a photo keeps the same colour on the server and in the browser.
   */
  protected getAvatarHue(member: RelationshipMember): number {
    const name = this.getMemberName(member);
    let hash = 0;

    for (let index = 0; index < name.length; index++) {
      hash = (hash * 31 + name.charCodeAt(index)) % 360;
    }

    return hash;
  }

  protected getUserName(user: UserDetails): string {
    return (
      user.profile?.displayName ||
      user.profile?.fullName ||
      user.username ||
      'Unknown User'
    );
  }
}
import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import {
  Relationship,
  RelationshipMember,
  RelationshipStatus,
  RelationshipType
} from '../../../../core/interfaces/relationship.dto';

@Component({
  selector: 'app-relationship-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ToggleSwitchModule,
    AvatarModule,
    TagModule,
    CardModule,
    DividerModule,
    DialogModule,
    ConfirmDialogModule
  ],
  templateUrl: './relationship-detail.html',
  styleUrl: './relationship-detail.scss'
})
export class RelationshipDetail implements OnInit {

  private readonly fb = inject(FormBuilder);

  readonly relationship = input.required<Relationship>();

  protected readonly relationshipTypes = [
    {
      label: 'Friendship',
      value: RelationshipType.FRIENDSHIP
    },
    {
      label: 'Romantic',
      value: RelationshipType.ROMANTIC
    },
    {
      label: 'Family',
      value: RelationshipType.FAMILY
    },
    {
      label: 'Group',
      value: RelationshipType.GROUP
    }
  ];

  protected readonly relationshipStatuses = [
    {
      label: 'Active',
      value: RelationshipStatus.ACTIVE
    },
    {
      label: 'Inactive',
      value: RelationshipStatus.INACTIVE
    }
  ];

  protected members: RelationshipMember[] = [];

  protected relationshipForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    type: [RelationshipType.FRIENDSHIP, Validators.required],
    status: [RelationshipStatus.ACTIVE, Validators.required],
    startAt: [new Date(), Validators.required]
  });

  protected showAddMemberDialog = false;

  ngOnInit(): void {
    this.relationshipForm.patchValue({
      name: this.relationship().name,
      type: this.relationship().type,
      status: this.relationship().status,
      startAt: new Date(this.relationship().startAt)
    });

    this.members = [...this.relationship().members];
  }

  protected saveRelationship(): void {
    if (this.relationshipForm.invalid) {
      this.relationshipForm.markAllAsTouched();
      return;
    }

    const formValue = this.relationshipForm.getRawValue();

    const request = {
      ...formValue,
      startAt: formValue.startAt.toISOString()
    };

    console.log('save relationship:', request);
  }

  protected cancel(): void {
    this.relationshipForm.patchValue({
      name: this.relationship().name,
      type: this.relationship().type,
      status: this.relationship().status,
      startAt: new Date(this.relationship().startAt)
    });
  }

  protected toggleMember(member: RelationshipMember): void {
    member.active = !member.active;

    console.log(
      member.active
        ? 'activate member'
        : 'deactivate member',
      member
    );
  }

  protected removeMember(member: RelationshipMember): void {
    this.members = this.members.filter(
      item => item.id !== member.id
    );

    console.log('remove member:', member);
  }

  protected addMember(member: RelationshipMember): void {
    this.members = [...this.members, member];
    this.showAddMemberDialog = false;
  }

  protected getMemberName(member: RelationshipMember): string {
    return (
      member.user.profile.displayName ||
      member.user.profile.fullName ||
      member.user.username
    );
  }

  protected getMemberInitial(member: RelationshipMember): string {
    return this.getMemberName(member)
      .charAt(0)
      .toUpperCase();
  }
}
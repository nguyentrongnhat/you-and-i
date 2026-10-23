import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Relationship } from '../../../../core/interfaces/relationship.dto';
import { NavigationService } from '../../../../services/navigation.service';
import { RelationshipService } from '../../services/relationship.service';
import { LoaderService } from '../../../../services/loader.service';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../services/toast.service';
import { MESSAGE_TYPE } from '../../../../core/enums';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-relationship-management',
  imports: [DataView, ButtonModule, Tag, DialogModule, CommonModule, ConfirmDialogModule],
  templateUrl: './relationship-management.html',
  styleUrl: './relationship-management.scss',
})
export class RelationshipManagement implements OnInit{
  
  protected relationshipService = inject(RelationshipService);

  protected loaderService = inject(LoaderService);
  
  protected navigationService = inject(NavigationService);

  protected allRelationships = signal<Relationship[]>([]);

  protected toastService = inject(ToastService);

  protected displayConfirmDeleteDialog = signal(false);

  protected relationshipIdToDelete = signal<string | null>(null);

  ngOnInit(): void {
    this.relationshipService.getAllRelationships().subscribe((relationships) => {
      this.allRelationships.set(relationships);
    });
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
    this.relationshipService.deleteRelationship(id)
    .pipe(finalize(() => {
      this.loaderService.hide();
    }))
    .subscribe(() => {
      this.allRelationships.set(
        this.allRelationships().filter((relationship) => relationship.id !== id)
      );
      this.toastService.showToast(MESSAGE_TYPE.SUCCESS, 'Deleted', 'Relationship deleted successfully');
      this.displayConfirmDeleteDialog.set(false);
      this.relationshipIdToDelete.set(null);
    });
  }

  protected confirmDeleteRelationship(id: string): void {
    this.relationshipIdToDelete.set(id);
    this.displayConfirmDeleteDialog.set(true);
  }

  protected cancelDeleteRelationship(): void {
    this.displayConfirmDeleteDialog.set(false);
    this.relationshipIdToDelete.set(null);
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { RelationshipService } from '../../services/relationship.service';
import { CommonModule } from '@angular/common';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { Relationship } from '../../../../core/interfaces/relationship.dto';
import { DialogModule } from 'primeng/dialog';
import { RelationshipDetail } from '../relationship-detail/relationship-detail';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-relationship-management',
  imports: [DataView, ButtonModule, Tag, DialogModule, CommonModule, RelationshipDetail],
  templateUrl: './relationship-management.html',
  styleUrl: './relationship-management.scss',
})
export class RelationshipManagement implements OnInit{
  
  protected relationshipService = inject(RelationshipService);

  protected allRelationships = signal<Relationship[]>([]);

  protected showGameHistories = signal(false);

  ngOnInit(): void {
    this.relationshipService.getAllRelationships().subscribe((relationships) => {
      console.log('allRelationships: ', relationships);
      this.allRelationships.set(relationships);
    });
  }

  protected showGameHistoriesDialog() {
    console.log('showGameHistoriesDialog called');
      this.showGameHistories.set(true);
   }

}

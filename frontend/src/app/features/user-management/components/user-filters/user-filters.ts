import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

export interface FilterChip {
	label: string;
	value: string;
	icon?: string;
}

@Component({
	selector: 'app-user-filters',
	imports: [FormsModule, IconFieldModule, InputIconModule, InputTextModule],
	templateUrl: './user-filters.html',
	styleUrl: './user-filters.scss',
})
export class UserFilters {
	readonly searchTerm = input<string>('');
	readonly statusFilter = input<string>('ALL');
	readonly roleFilter = input<string>('ALL');
	readonly statusChips = input.required<FilterChip[]>();
	readonly roleChips = input.required<FilterChip[]>();
	readonly resultCount = input.required<number>();
	readonly total = input.required<number>();
	readonly hasActiveFilters = input<boolean>(false);

	readonly searchChange = output<string>();
	readonly statusChange = output<string>();
	readonly roleChange = output<string>();
	readonly clear = output<void>();
}

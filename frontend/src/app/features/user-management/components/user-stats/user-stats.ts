import { Component, input } from '@angular/core';

@Component({
	selector: 'app-user-stats',
	imports: [],
	templateUrl: './user-stats.html',
	styleUrl: './user-stats.scss',
})
export class UserStats {
	readonly total = input.required<number>();
	readonly active = input.required<number>();
	readonly verified = input.required<number>();
	readonly admin = input.required<number>();
}

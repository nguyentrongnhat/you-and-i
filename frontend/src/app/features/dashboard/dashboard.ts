import { AfterViewInit, Component, inject, model, OnInit, signal } from '@angular/core';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { PhotoService } from '../../services/photo.service';
import { NavigationService } from '../../services/navigation.service';
import { UserService } from '../user-management/services/user.service';
import { LoaderService } from '../../services/loader.service';
import { PlatformService } from '../../services/platform.service';

@Component({
	selector: 'app-dashboard',
	imports: [ButtonModule, CardModule, TableModule, GalleriaModule, PanelModule, AvatarModule, AnimateOnScrollModule],
	templateUrl: './dashboard.html',
	styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {

	private readonly photoService = inject(PhotoService);

	protected readonly userService = inject(UserService);

	private readonly navigationService = inject(NavigationService);

	private readonly loaderService = inject(LoaderService);

	private readonly platformService = inject(PlatformService);

	protected images: any = model([]);

	protected responsiveOptions: any[] = [];

	protected dailyActivityitems = signal<any[]>([
		{
			title: 'Find Number Game',
			subTitle: 'Chơi game và Nhớ anh',
			description: 'Tìm các số lần lượt từ 1 đến 100 trong điều kiện thách thức về mặt thời gian',
			icon: 'pi pi-discord',
			url: 'game/find-number-game'
		},
		{
			title: 'Go Go Go',
			subTitle: 'Lên kế hoạch nào',
			description: 'Tìm các số lần lượt từ 1 đến 100 trong điều kiện thách thức về mặt thời gian',
			icon: 'pi pi-list-check',
			url: 'go-go-go'
		}
	]);


	ngOnInit(): void {
		this.photoService.getImages().then((images) => {
			this.images.set(images)
		});
	}


	ngAfterViewInit(): void {
		if(!this.platformService.isBrowser()) return;
		this.loaderService.hide();
	}


	navigateTo(url: string) {
		this.navigationService.navigate(url);
	}
}

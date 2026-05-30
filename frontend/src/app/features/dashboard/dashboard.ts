import { Component, inject, model, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { PhotoService } from '../../services/photo.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, CardModule, TableModule, GalleriaModule, PanelModule, AvatarModule, AnimateOnScrollModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private readonly photoService = inject(PhotoService);

  protected readonly userService = inject(UserService);

	private readonly router = inject(Router);

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
      url: 'game/find-number-game'
    }
  ]);


  ngOnInit(): void {
    this.photoService.getImages().then((images) => {
      this.images.set(images)
    });
  }


  navigateTo(url: string) {
    this.router.navigateByUrl(url);
  }
}

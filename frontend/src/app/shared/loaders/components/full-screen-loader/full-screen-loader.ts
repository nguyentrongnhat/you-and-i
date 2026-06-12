import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../../services/loader.service';

@Component({
  selector: 'app-full-screen-loader',
  imports: [],
  templateUrl: './full-screen-loader.html',
  styleUrl: './full-screen-loader.scss',
})
export class FullScreenLoader {
  protected loaderService = inject(LoaderService);
}

import { Component, inject } from '@angular/core';
import { LoaderService } from '../../core/services/loader-service';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  private loaderService = inject(LoaderService);
 
  readonly loading = this.loaderService.loading;
}

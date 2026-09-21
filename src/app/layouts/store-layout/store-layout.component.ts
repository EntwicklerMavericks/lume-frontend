import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreHeaderComponent } from '../../features/store/components/store-header/store-header.component';
import { StoreFooterComponent } from '../../features/store/components/store-footer/store-footer.component';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [RouterOutlet, StoreHeaderComponent, StoreFooterComponent],
  templateUrl: './store-layout.component.html',
  styleUrls: ['./store-layout.component.scss']
})
export class StoreLayoutComponent {}

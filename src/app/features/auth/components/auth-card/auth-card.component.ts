import { Component, Input } from '@angular/core';
import { STORE_CONFIG } from '../../../../core/config/store.config';

@Component({
  selector: 'app-auth-card',
  standalone: true,
  templateUrl: './auth-card.component.html',
  styleUrl: './auth-card.component.scss'
})
export class AuthCardComponent {
  storeConfig = STORE_CONFIG;
  @Input() title: string = '';
  @Input() subtitle: string = '';
}

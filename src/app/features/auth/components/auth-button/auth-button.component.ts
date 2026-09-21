import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  templateUrl: './auth-button.component.html',
  styleUrl: './auth-button.component.scss'
})
export class AuthButtonComponent {
  @Input() type: 'submit' | 'button' = 'submit';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
}

import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService } from './core/services/seo.service';
import { STORE_CONFIG } from './core/config/store.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private seoService = inject(SeoService);
  title = STORE_CONFIG.name;

  ngOnInit(): void {
    this.seoService.setPageMeta();
  }
}

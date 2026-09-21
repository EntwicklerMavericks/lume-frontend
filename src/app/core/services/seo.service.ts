import { inject, Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { STORE_CONFIG } from '../config/store.config';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  /**
   * Define o título e a descrição da página
   */
  setPageMeta(title?: string, description?: string, ogImage?: string): void {
    const fullTitle = title 
      ? `${title} | ${STORE_CONFIG.name}` 
      : `${STORE_CONFIG.name} — Moda Esportiva & Casual | Academia e Passeios`;

    this.titleService.setTitle(fullTitle);

    if (description) {
      this.metaService.updateTag({ name: 'description', content: description });
      this.metaService.updateTag({ property: 'og:description', content: description });
    }

    this.metaService.updateTag({ property: 'og:title', content: fullTitle });

    if (ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: ogImage });
    }
  }

  /**
   * Reseta os metadados para os padrões da loja
   */
  resetMeta(): void {
    this.setPageMeta();
  }
}

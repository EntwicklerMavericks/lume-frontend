import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  template: `
    <div class="placeholder-container animate-fade-in">
      <div class="header-section">
        <h1>{{ title }}</h1>
        <p class="subtitle">{{ description }}</p>
      </div>

      <!-- Reusable Table skeleton representing database loading states -->
      <div class="skeleton-card">
        <div class="card-header">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
        <div class="card-body">
          @for (item of [1, 2, 3, 4, 5]; track item) {
            <div class="table-skeleton-row">
              <div class="skeleton skeleton-cell cell-sm"></div>
              <div class="skeleton skeleton-cell cell-lg"></div>
              <div class="skeleton skeleton-cell cell-md"></div>
              <div class="skeleton skeleton-cell cell-sm"></div>
              <div class="skeleton skeleton-cell cell-action"></div>
            </div>
          }
        </div>
      </div>

      <div class="info-alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div>
          <h4>Área em Construção</h4>
          <p>Esta tela está com a estrutura preparada no menu do ERP <strong>Lume</strong> e será integrada com a respectiva API de vendas na próxima etapa de desenvolvimento.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 1rem 0;
    }

    .header-section {
      h1 {
        font-size: 1.85rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        margin-bottom: 0.5rem;
        color: #ffffff;
      }
      .subtitle {
        font-size: 0.9375rem;
        color: var(--text-secondary);
      }
    }

    .skeleton-card {
      background-color: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .skeleton-title {
      height: 20px;
      width: 150px;
    }

    .skeleton-btn {
      height: 36px;
      width: 100px;
      border-radius: var(--radius-md);
    }

    .table-skeleton-row {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      padding: 1.25rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      
      &:last-child {
        border-bottom: none;
      }
    }

    .skeleton-cell {
      height: 16px;
      border-radius: var(--radius-sm);
    }

    .cell-sm { width: 60px; }
    .cell-md { width: 120px; }
    .cell-lg { width: 100%; max-width: 300px; }
    .cell-action { width: 36px; border-radius: 50%; height: 36px; margin-left: auto; }

    .info-alert {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      align-items: flex-start;
      color: var(--text-secondary);
      line-height: 1.5;
      
      svg {
        color: #ffffff;
        flex-shrink: 0;
        margin-top: 0.15rem;
      }

      h4 {
        color: #ffffff;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.8125rem;
      }
    }
  `],
  imports: []
})
export class PlaceholderPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  title: string = 'Carregando...';
  description: string = 'Preparando a interface';

  ngOnInit() {
    this.title = this.route.snapshot.data['title'] || 'Módulo do ERP';
    this.description = this.route.snapshot.data['description'] || 'Gerenciamento do painel administrativo da loja.';
  }
}

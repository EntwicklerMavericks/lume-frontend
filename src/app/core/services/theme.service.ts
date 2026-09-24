import { Injectable } from '@angular/core';
import { STORE_CONFIG } from '../config/store.config';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /**
   * Aplica o tema configurado em STORE_CONFIG (ou overrides) diretamente nas CSS custom properties do documento.
   */
  applyTheme(overrides?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    sectionBg?: string;
  }): void {
    if (typeof document === 'undefined' || !document.documentElement) {
      return;
    }

    const primary = overrides?.primaryColor || STORE_CONFIG.primaryColor || '#0DF5A4';
    const secondary = overrides?.secondaryColor || STORE_CONFIG.secondaryColor || '#FFFFFF';
    const background = overrides?.backgroundColor || (STORE_CONFIG as any).backgroundColor || '#080809';
    const sectionBg = overrides?.sectionBg || (STORE_CONFIG as any).sectionBg || background;

    const root = document.documentElement;
    const primaryRgb = this.hexToRgb(primary);
    const secondaryRgb = this.hexToRgb(secondary);
    const backgroundRgb = this.hexToRgb(background);
    const sectionRgb = this.hexToRgb(sectionBg);

    // 1. Cor de Fundo da Loja (Background) e Derivadas de Superfície
    root.style.setProperty('--background', background);

    if (backgroundRgb) {
      const isBgLight = this.calculateLuminance(backgroundRgb) > 0.5;
      const surfaceBg = this.adjustBrightness(backgroundRgb, isBgLight ? -6 : 8);
      const surfaceHover = this.adjustBrightness(backgroundRgb, isBgLight ? -12 : 15);
      const footerBg = this.adjustBrightness(backgroundRgb, isBgLight ? -10 : -8);
      const sidebarBg = isBgLight ? surfaceBg : this.adjustBrightness(backgroundRgb, 3);
      const borderColor = isBgLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)';
      const borderHover = isBgLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.15)';

      root.style.setProperty('--surface', surfaceBg);
      root.style.setProperty('--surface-hover', surfaceHover);
      root.style.setProperty('--footer-bg', footerBg);
      root.style.setProperty('--sidebar-bg', sidebarBg);
      root.style.setProperty('--bg-surface', surfaceBg);
      root.style.setProperty('--border-color', borderColor);
      root.style.setProperty('--border-hover', borderHover);
      root.style.setProperty('--header-bg', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.95)`);
      root.style.setProperty('--hero-overlay-start', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.4)`);
      root.style.setProperty('--hero-overlay-mid', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.72)`);
      root.style.setProperty('--hero-overlay-end', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.98)`);

      // Garante contraste legível para textos padrão
      const textPrimary = isBgLight ? '#111827' : '#F4F4F5';
      const textSecondary = isBgLight ? '#4B5563' : '#A1A1AA';
      const textMuted = isBgLight ? '#9CA3AF' : '#71717A';
      root.style.setProperty('--text-primary', textPrimary);
      root.style.setProperty('--text-secondary', textSecondary);
      root.style.setProperty('--text-muted', textMuted);
    } else {
      root.style.setProperty('--surface', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--surface-hover', 'rgba(255, 255, 255, 0.09)');
      root.style.setProperty('--footer-bg', background);
      root.style.setProperty('--sidebar-bg', background);
      root.style.setProperty('--bg-surface', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--border-hover', 'rgba(255, 255, 255, 0.15)');
      root.style.setProperty('--header-bg', 'rgba(10, 21, 46, 0.95)');
      root.style.setProperty('--hero-overlay-start', 'rgba(10, 21, 46, 0.4)');
      root.style.setProperty('--hero-overlay-mid', 'rgba(10, 21, 46, 0.72)');
      root.style.setProperty('--hero-overlay-end', 'rgba(10, 21, 46, 0.98)');
    }

    // 2. Cor Primária da Marca e Derivadas (Destaques, Botões, Acentos)
    root.style.setProperty('--primary', primary);

    if (primaryRgb) {
      const contrast = this.getContrastColor(primaryRgb);
      root.style.setProperty('--primary-contrast', contrast);
      root.style.setProperty('--primary-focus', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`);
      root.style.setProperty('--primary-light', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
      root.style.setProperty('--primary-glow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.28)`);
      root.style.setProperty('--header-border', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.22)`);
      root.style.setProperty('--border-focus', primary);

      // Hover
      const isLight = this.calculateLuminance(primaryRgb) > 0.5;
      const hover = this.adjustBrightness(primaryRgb, isLight ? -15 : 20);
      root.style.setProperty('--primary-hover', hover);

      // Degradê da marca
      const lightAccent = this.adjustBrightness(primaryRgb, 14);
      const darkAccent = this.adjustBrightness(primaryRgb, -14);
      root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${lightAccent} 0%, ${primary} 50%, ${darkAccent} 100%)`);
    } else {
      root.style.setProperty('--primary-contrast', '#000000');
      root.style.setProperty('--primary-hover', primary);
      root.style.setProperty('--primary-glow', 'rgba(255, 255, 255, 0.2)');
      root.style.setProperty('--header-border', 'rgba(255, 255, 255, 0.15)');
      root.style.setProperty('--border-focus', primary);
      root.style.setProperty('--primary-gradient', primary);
    }

    // 3. Cor Secundária da Marca e Derivadas (Detalhes, Apoio, Bordas Suaves)
    root.style.setProperty('--secondary', secondary);

    if (secondaryRgb) {
      const isLight = this.calculateLuminance(secondaryRgb) > 0.5;
      const secHover = this.adjustBrightness(secondaryRgb, isLight ? -15 : 20);
      root.style.setProperty('--secondary-hover', secHover);
      root.style.setProperty('--border-subtle', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.25)`);
    } else {
      root.style.setProperty('--secondary-hover', secondary);
      root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.15)');
    }

    // 4. Cor de Fundo das Seções da Vitrine (Categorias, Destaques, Lançamentos)
    root.style.setProperty('--section-bg', sectionBg);

    if (sectionRgb) {
      const isSectionLight = this.calculateLuminance(sectionRgb) > 0.5;
      const sectionTextPrimary = isSectionLight ? '#111827' : '#F4F4F5';
      const sectionTextSecondary = isSectionLight ? '#4B5563' : '#A1A1AA';
      const sectionTextMuted = isSectionLight ? '#64748B' : '#71717A';
      const sectionBorder = isSectionLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)';
      const sectionCardBg = isSectionLight ? '#F8FAFC' : this.adjustBrightness(sectionRgb, 6);
      const sectionCardBorder = isSectionLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)';

      root.style.setProperty('--section-text-primary', sectionTextPrimary);
      root.style.setProperty('--section-text-secondary', sectionTextSecondary);
      root.style.setProperty('--section-text-muted', sectionTextMuted);
      root.style.setProperty('--section-border', sectionBorder);
      root.style.setProperty('--section-card-bg', sectionCardBg);
      root.style.setProperty('--section-card-border', sectionCardBorder);
    } else {
      root.style.setProperty('--section-text-primary', '#F4F4F5');
      root.style.setProperty('--section-text-secondary', '#A1A1AA');
      root.style.setProperty('--section-text-muted', '#71717A');
      root.style.setProperty('--section-border', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--section-card-bg', 'rgba(255, 255, 255, 0.04)');
      root.style.setProperty('--section-card-border', 'rgba(255, 255, 255, 0.08)');
    }
  }

  /**
   * Converte string hex (#ffffff ou #fff) para componentes RGB.
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!hex) return null;
    const cleanHex = hex.replace('#', '').trim();

    if (cleanHex.length === 3) {
      const r = parseInt(cleanHex[0] + cleanHex[0], 16);
      const g = parseInt(cleanHex[1] + cleanHex[1], 16);
      const b = parseInt(cleanHex[2] + cleanHex[2], 16);
      return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
    }

    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
    }

    return null;
  }

  /**
   * Calcula luminância perceptiva da cor (0 a 1).
   */
  private calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  }

  /**
   * Retorna '#000000' ou '#ffffff' dependendo da luminância para contraste legível.
   */
  private getContrastColor(rgb: { r: number; g: number; b: number }): string {
    return this.calculateLuminance(rgb) > 0.55 ? '#000000' : '#ffffff';
  }

  /**
   * Ajusta brilho (+ para clarear, - para escurecer).
   */
  private adjustBrightness(rgb: { r: number; g: number; b: number }, percent: number): string {
    const factor = percent / 100;
    const r = Math.min(255, Math.max(0, Math.round(rgb.r + 255 * factor)));
    const g = Math.min(255, Math.max(0, Math.round(rgb.g + 255 * factor)));
    const b = Math.min(255, Math.max(0, Math.round(rgb.b + 255 * factor)));

    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

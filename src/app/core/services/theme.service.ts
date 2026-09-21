import { Injectable } from '@angular/core';
import { STORE_CONFIG } from '../config/store.config';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /**
   * Aplica o tema configurado em STORE_CONFIG (ou overrides) diretamente nas CSS custom properties do documento.
   */
  applyTheme(overrides?: { primaryColor?: string; secondaryColor?: string }): void {
    if (typeof document === 'undefined' || !document.documentElement) {
      return;
    }

    const primary = overrides?.primaryColor || STORE_CONFIG.primaryColor || '#ffffff';
    const secondary = overrides?.secondaryColor || STORE_CONFIG.secondaryColor || '#a1a1aa';

    const root = document.documentElement;

    // 1. Cor Primária e Derivadas
    root.style.setProperty('--primary', primary);

    const primaryRgb = this.hexToRgb(primary);
    if (primaryRgb) {
      const contrast = this.getContrastColor(primaryRgb);
      root.style.setProperty('--primary-contrast', contrast);
      root.style.setProperty('--primary-focus', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`);
      root.style.setProperty('--primary-light', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
      
      // Hover: se for claro escurece 12%, se for escuro clareia 12%
      const isLight = this.calculateLuminance(primaryRgb) > 0.5;
      const hover = this.adjustBrightness(primaryRgb, isLight ? -15 : 20);
      root.style.setProperty('--primary-hover', hover);
    } else {
      root.style.setProperty('--primary-contrast', '#000000');
      root.style.setProperty('--primary-hover', primary);
    }

    // 2. Cor Secundária e Derivadas
    root.style.setProperty('--secondary', secondary);

    const secondaryRgb = this.hexToRgb(secondary);
    if (secondaryRgb) {
      const isLight = this.calculateLuminance(secondaryRgb) > 0.5;
      const secHover = this.adjustBrightness(secondaryRgb, isLight ? -15 : 20);
      root.style.setProperty('--secondary-hover', secHover);
    } else {
      root.style.setProperty('--secondary-hover', secondary);
    }

    // 3. Foco de Borda
    root.style.setProperty('--border-focus', primary);
  }

  /**
   * Converte string hex (#ffffff ou #fff) para componentes RGB.
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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

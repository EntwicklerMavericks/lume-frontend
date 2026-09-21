import { Component, signal } from '@angular/core';

interface GalleryImage {
  id: string;
  url: string;
  filename: string;
  size: string;
  productSku: string;
}

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [],
  templateUrl: './gallery-page.component.html',
  styleUrl: './gallery-page.component.scss'
})
export class GalleryPageComponent {
  // Premium clothing store mock assets
  images = signal<GalleryImage[]>([
    {
      id: 'g1',
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      filename: 'pima_black_front.webp',
      size: '180 KB',
      productSku: 'BI-TSH-001'
    },
    {
      id: 'g2',
      url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      filename: 'chino_slim_gray_standing.webp',
      size: '320 KB',
      productSku: 'BI-PAN-002'
    },
    {
      id: 'g3',
      url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      filename: 'bomber_leather_eclipse_look.webp',
      size: '1.2 MB',
      productSku: 'BI-JAC-003'
    },
    {
      id: 'g4',
      url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500',
      filename: 'catalog_autumn_model.webp',
      size: '850 KB',
      productSku: 'BI-TSH-001'
    }
  ]);

  deleteImage(id: string): void {
    if (confirm('Tem certeza que deseja remover esta imagem da galeria?')) {
      this.images.set(this.images().filter(img => img.id !== id));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = input.files;
      const current = [...this.images()];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e: any) => {
          current.push({
            id: Date.now().toString() + i,
            url: e.target.result,
            filename: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`,
            productSku: 'Geral'
          });
          this.images.set([...current]);
        };
        
        reader.readAsDataURL(file);
      }
    }
  }
}

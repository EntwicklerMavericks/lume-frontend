import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface StockMovement {
  id: string;
  sku: string;
  productName: string;
  type: 'entrada' | 'saída' | 'ajuste';
  quantity: number;
  date: string;
  reason: string;
  user: string;
}

interface ProductStock {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
}

@Component({
  selector: 'app-stock-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stock-page.component.html',
  styleUrl: './stock-page.component.scss'
})
export class StockPageComponent {
  private fb = inject(FormBuilder);

  showAdjustModal = signal<boolean>(false);

  // Mock list of clothing item stock levels
  products = signal<ProductStock[]>([
    { id: '1', sku: 'BI-TSH-001', name: 'Camiseta Pima Premium Black', stock: 45, minStock: 10 },
    { id: '2', sku: 'BI-PAN-002', name: 'Calça Chino Slim Gray', stock: 12, minStock: 15 },
    { id: '3', sku: 'BI-JAC-003', name: 'Jaqueta Bomber Couro Eclipse', stock: 3, minStock: 5 },
    { id: '4', sku: 'BI-HD-004', name: 'Moletom Canguru Off-White', stock: 0, minStock: 8 }
  ]);

  // Mock movement log lines
  movements = signal<StockMovement[]>([
    { id: 'm1', sku: 'BI-TSH-001', productName: 'Camiseta Pima Premium Black', type: 'entrada', quantity: 50, date: '2026-07-09 10:15', reason: 'Compra de fornecedor', user: 'João Paulo' },
    { id: 'm2', sku: 'BI-PAN-002', productName: 'Calça Chino Slim Gray', type: 'saída', quantity: -2, date: '2026-07-09 09:30', reason: 'Venda de Pedido #1024', user: 'Sistema' },
    { id: 'm3', sku: 'BI-HD-004', productName: 'Moletom Canguru Off-White', type: 'ajuste', quantity: -3, date: '2026-07-08 16:45', reason: 'Ajuste de inventário (defeito)', user: 'João Paulo' }
  ]);

  adjustForm: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    type: ['entrada', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: ['', Validators.required]
  });

  openAdjustModal(): void {
    this.adjustForm.reset({
      productId: '',
      type: 'entrada',
      quantity: 1,
      reason: ''
    });
    this.showAdjustModal.set(true);
  }

  closeModal(): void {
    this.showAdjustModal.set(false);
  }

  onSubmit(): void {
    if (this.adjustForm.invalid) {
      return;
    }

    const { productId, type, quantity, reason } = this.adjustForm.value;
    const prod = this.products().find(p => p.id === productId);

    if (!prod) return;

    const qtyMod = type === 'entrada' ? quantity : -quantity;
    const nextStock = Math.max(0, prod.stock + qtyMod);

    // Apply adjustments
    this.products.update(list => list.map(item => {
      if (item.id === productId) {
        return { ...item, stock: nextStock };
      }
      return item;
    }));

    // Record logs
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      sku: prod.sku,
      productName: prod.name,
      type: type === 'entrada' ? 'entrada' : type === 'saída' ? 'saída' : 'ajuste',
      quantity: qtyMod,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reason,
      user: 'João Paulo'
    };

    this.movements.set([newMovement, ...this.movements()]);
    this.closeModal();
  }
}

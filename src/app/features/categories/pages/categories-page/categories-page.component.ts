import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCategory, AdminProductsService } from '../../../../core/services/admin-products.service';
import { StoreService } from '../../../../core/services/store.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
})
export class CategoriesPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminProductsService = inject(AdminProductsService);
  private storeService = inject(StoreService);

  showModal = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  feedbackMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  categories = signal<AdminCategory[]>([]);
  searchTerm = signal<string>('');
  editingCategoryId = signal<string | null>(null);

  categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: [''],
    description: [''],
    image: [''],
  });

  filteredCategories = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.categories();
    return this.categories().filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminProductsService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as categorias da loja.');
        this.isLoading.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  openAddModal(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({
      name: '',
      slug: '',
      description: '',
      image: '',
    });
    this.showModal.set(true);
  }

  openEditModal(category: AdminCategory): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCategoryId.set(null);
    this.categoryForm.reset();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.categoryForm.value;

    const payload: Partial<AdminCategory> = {
      name: formVal.name.trim(),
      slug: formVal.slug ? formVal.slug.trim() : undefined,
      description: formVal.description ? formVal.description.trim() : undefined,
      image: formVal.image ? formVal.image.trim() : undefined,
    };

    const editId = this.editingCategoryId();

    if (editId) {
      this.adminProductsService.updateCategory(editId, payload).subscribe({
        next: (updated) => {
          this.categories.update((list) =>
            list.map((c) => (c.id === editId ? { ...c, ...updated } : c))
          );
          this.storeService.loadData();
          this.closeModal();
          this.isSubmitting.set(false);
          this.showFeedback('Categoria atualizada com sucesso!', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || 'Erro ao atualizar categoria.';
          this.showFeedback(msg, 'error');
        },
      });
    } else {
      this.adminProductsService.createCategory(payload).subscribe({
        next: (created) => {
          this.categories.update((list) => [created, ...list]);
          this.storeService.loadData();
          this.closeModal();
          this.isSubmitting.set(false);
          this.showFeedback('Categoria criada com sucesso!', 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || 'Erro ao criar categoria.';
          this.showFeedback(msg, 'error');
        },
      });
    }
  }

  deleteCategory(cat: AdminCategory): void {
    if (cat._count && cat._count.products > 0) {
      this.showFeedback(
        `Não é possível excluir "${cat.name}" pois existem ${cat._count.products} produto(s) vinculados a ela.`,
        'error'
      );
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir a categoria "${cat.name}"?`)) {
      return;
    }

    this.adminProductsService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== cat.id));
        this.storeService.loadData();
        this.showFeedback('Categoria excluída com sucesso!', 'success');
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro ao excluir categoria.';
        this.showFeedback(msg, 'error');
      },
    });
  }

  private showFeedback(text: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set({ text, type });
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 4500);
  }
}

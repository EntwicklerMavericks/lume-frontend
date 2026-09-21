import { Category } from '../models/store.models';

/**
 * Categorias mockadas — estrutura idêntica ao contrato futuro da API.
 * Substituir por chamadas HTTP quando o backend estiver pronto.
 */
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Camisetas Oversized',
    slug: 'camisetas',
    description: 'Camisetas oversized e boxy com tecidos de alta gramatura.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  },
  {
    id: 'cat-2',
    name: 'Calças Cargo',
    slug: 'calcas',
    description: 'Calças cargo, parachute e joggers com estética urbana.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
  },
  {
    id: 'cat-3',
    name: 'Hoodies & Jaquetas',
    slug: 'jaquetas',
    description: 'Hoodies pesados, windbreakers e jaquetas street.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
  },
  {
    id: 'cat-4',
    name: 'Shorts & Bermudas',
    slug: 'shorts',
    description: 'Bermudas cargo e shorts de ripstop para compor o visual.',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
  },
  {
    id: 'cat-5',
    name: 'Bags & Acessórios',
    slug: 'acessorios',
    description: 'Shoulder bags, bonés e correntes para finalizar o kit.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
  },
];

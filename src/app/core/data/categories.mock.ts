import { Category } from '../models/store.models';

/**
 * Categorias mockadas — estrutura idêntica ao contrato futuro da API.
 * Substituir por chamadas HTTP quando o backend estiver pronto.
 */
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Camisetas & Tops',
    slug: 'camisetas',
    description: 'Camisetas dry-fit, regatas e tops para treino intenso e uso casual.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
  },
  {
    id: 'cat-2',
    name: 'Calças & Leggings',
    slug: 'calcas',
    description: 'Leggings modeladoras de alta compressão e calças joggers esportivas.',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
  },
  {
    id: 'cat-3',
    name: 'Casacos & Corta-Ventos',
    slug: 'jaquetas',
    description: 'Windbreakers, jaquetas esportivas e agasalhos para treino e passeios.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
  },
  {
    id: 'cat-4',
    name: 'Shorts & Bermudas',
    slug: 'shorts',
    description: 'Bermudas 2 em 1 de compressão e shorts leves para treino e lazer.',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
  },
  {
    id: 'cat-5',
    name: 'Bolsas & Acessórios',
    slug: 'acessorios',
    description: 'Mochilas gym, shoulder bags, bonés e acessórios fitness.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  },
];

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'produto/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'pedido-confirmado/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

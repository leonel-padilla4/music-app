import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'buscar',
    loadComponent: () =>
      import('./buscar/buscar.page').then( m => m.BuscarPage)
  },
  {
    path: 'biblioteca',
    loadComponent: () =>
      import('./biblioteca/biblioteca.page').then( m => m.BibliotecaPage)
  },
];

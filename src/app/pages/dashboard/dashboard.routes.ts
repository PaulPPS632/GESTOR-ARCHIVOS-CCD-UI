import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { authGuard } from "../../auth.guard";


const routes: Routes = [
  {
    path:'Home',
    data: {
      title: 'Usuarios',
      roles: ['admin']
    },
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path:'Home/:path',
    data: {
      title: 'Usuarios',
      roles: ['admin']
    },
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path:'Shared',
    loadComponent: () => import('./shared/shared.component').then((m) => m.SharedComponent),
  },
  {
    path:'Shared/:path',
    loadComponent: () => import('./shared/shared.component').then((m) => m.SharedComponent),
  },
  {
    path: 'Usuarios',
    data: {
      title: 'Usuarios',
      roles: ['admin']
    },
    canActivate: [authGuard],
    loadComponent: () => import('./usuarios/usuarios.component').then((m) => m.UsuariosComponent),
  },
  {
    path: 'Usuarios/:id',
    data: {
      title: 'Usuarios',
      roles: ['admin']
    },
    canActivate: [authGuard],
    loadComponent: () => import('./usuariodetail/usuariodetail.component').then((m) => m.UsuariodetailComponent),
  },
  {
    path: '',
    redirectTo: 'Home',
    pathMatch: 'full'
  },
] as Routes;
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutesModule {}
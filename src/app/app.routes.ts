import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path:'login',
        loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path:'Dashboard',
        canActivate:[authGuard],
        data:{
            title:'Dashboard',
            roles: ['admin', 'usuario']
        },
        loadComponent: () => import('./pages/dashboard/layout/layout.component').then((m) => m.LayoutComponent),
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DashboardRoutesModule)
    },
    {
        path: '',
        redirectTo: 'login', // Redirige a 'bots'
        pathMatch: 'full', // pathMatch para que coincida exactamente
    },
];

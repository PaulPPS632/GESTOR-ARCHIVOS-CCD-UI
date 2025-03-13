import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path:'login',
        loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path:'files',
        //canActivate:[authGuard],
        data:{
            title:'Dashboard',
            roles: ['admin', 'usuario']
        },
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DashboardRoutesModule)
    },
    {
        path: '',
        redirectTo: 'login', // Redirige a 'bots'
        pathMatch: 'full', // pathMatch para que coincida exactamente
    },
];

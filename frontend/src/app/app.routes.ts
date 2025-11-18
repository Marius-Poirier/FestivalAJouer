import { Routes } from '@angular/router';
import { authGuard } from './shared/auth/auth-guard';
import { adminGuard } from './admin/admin-guard';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () => import('./shared/auth/login/login').then(m => m.Login)
    },
    {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
    },
    {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.AdminComponent),
    canActivate: [adminGuard]
    },
    {
    path: 'register',
    loadComponent: () => import('./shared/auth/register/register').then(m => m.Register),
    },
    {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
    }
];
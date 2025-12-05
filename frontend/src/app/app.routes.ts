import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth-guard';
import { adminGuard } from '@core/guards/admin-guard';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () => import('@auth/login/login').then(m => m.Login)
    },
    {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
    },
    {
    path: 'admin',
    loadComponent: () => import('@admin/admin').then(m => m.AdminComponent),
    canActivate: [adminGuard]
    },
    {
    path: 'register',
    loadComponent: () => import('@auth/register/register').then(m => m.Register),
    },
    {
    path: 'festivals',
    loadComponent: () => import('@festivals/components/festival-list/festival-list').then(m => m.FestivalList),
    canActivate: [authGuard]
    },
    {
    path: 'workflow',
    loadComponent: ()=> import('@festivals/components/workflow-festival/workflow-festival').then(m=>m.WorkflowFestival)
    }
];
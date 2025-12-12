import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth-guard';
import { adminGuard } from '@core/guards/admin-guard';
import { FestivalList } from '@festivals/components/festival-list/festival-list';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () => import('@auth/login/login').then(m => m.Login)
    },
    {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
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
    // {
    // path: 'festivals',
    // loadComponent: () => import('@festivals/components/festival-list/festival-list').then(m => m.FestivalList),
    // canActivate: [authGuard]
    // },
    {
    path: 'festivals',
    component: HomeComponent,
    },
    {
    path: 'editeurs',
    loadComponent: () => import('@editeurs/components/editeur-list/editeur-list').then(m => m.EditeurList),
    canActivate: [authGuard]
    },
    {
    path: 'editeurs/:id',
    loadComponent: () => import('@editeurs/components/editeur-detail/editeur-detail').then(m => m.EditeurDetail),
    canActivate: [authGuard]
    },
    {
    path: 'workflow',
    loadComponent: ()=> import('@festivals/components/workflow-festival/workflow-festival').then(m=>m.WorkflowFestival)
    }

];
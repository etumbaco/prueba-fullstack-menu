import { Routes } from '@angular/router';
import { PantallaGenericaComponent } from './shared/pantalla-generica.component';
import { RolesPageComponent } from './roles/roles-page.component';
import { ModulosPageComponent } from './modulos/modulos-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'administracion/modulos', component: ModulosPageComponent },
  { path: 'administracion/roles', component: RolesPageComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: PantallaGenericaComponent }
];

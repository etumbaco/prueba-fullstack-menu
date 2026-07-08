import { Routes } from '@angular/router';
import { PantallaGenericaComponent } from './shared/pantalla-generica.component';
import { RolesPageComponent } from './roles/roles-page.component';
import { ModulosPageComponent } from './modulos/modulos-page.component';

export const routes: Routes = [
  { path: 'administracion/modulos', component: ModulosPageComponent },
  { path: 'administracion/roles', component: RolesPageComponent },
  { path: '**', component: PantallaGenericaComponent }
];

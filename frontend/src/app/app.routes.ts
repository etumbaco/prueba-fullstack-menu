import { Routes } from '@angular/router';
import { PantallaGenericaComponent } from './shared/pantalla-generica.component';
import { RolesPageComponent } from './roles/roles-page.component';

export const routes: Routes = [
  { path: 'administracion/roles', component: RolesPageComponent },
  // TODO: ruta de gestion de modulos en el siguiente paso
  { path: '**', component: PantallaGenericaComponent }
];

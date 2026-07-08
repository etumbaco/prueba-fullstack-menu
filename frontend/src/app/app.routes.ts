import { Routes } from '@angular/router';
import { PantallaGenericaComponent } from './shared/pantalla-generica.component';

export const routes: Routes = [
  // TODO: rutas reales de gestion (modulos, roles) en el siguiente paso
  { path: '**', component: PantallaGenericaComponent }
];

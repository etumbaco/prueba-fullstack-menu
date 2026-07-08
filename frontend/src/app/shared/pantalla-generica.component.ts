import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pantalla-generica',
  template: `
    <div class="pantalla">
      <h2>Pantalla: {{ router.url }}</h2>
      <p>Contenido de ejemplo para esta ruta del menu.</p>
    </div>
  `,
  styles: `.pantalla { padding: 1rem; }`
})
export class PantallaGenericaComponent {
  readonly router = inject(Router);
}

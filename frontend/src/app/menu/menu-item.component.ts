import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuNode } from '../core/models/menu-node.model';

/**
 * Componente RECURSIVO: renderiza un nodo del menu y,
 * si tiene hijos, se invoca a si mismo por cada uno.
 */
@Component({
  selector: 'app-menu-item',
  imports: [RouterLink, RouterLinkActive, MenuItemComponent],
  template: `
    <li class="menu-item">
      <a [routerLink]="nodo().ruta" routerLinkActive="activo" class="menu-link">
        @if (nodo().icono) {
          <i [class]="nodo().icono"></i>
        }
        <span>{{ nodo().nombre }}</span>
      </a>

      @if (nodo().hijos.length > 0) {
        <ul class="menu-hijos">
          @for (hijo of nodo().hijos; track hijo.id) {
            <app-menu-item [nodo]="hijo" />
          }
        </ul>
      }
    </li>
  `,
  styles: `
    .menu-item { list-style: none; }
    .menu-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: var(--p-text-color);
      text-decoration: none;
    }
    .menu-link:hover { background: var(--p-surface-100); }
    .menu-link.activo {
      background: var(--p-primary-100);
      color: var(--p-primary-700);
      font-weight: 600;
    }
    .menu-hijos { margin: 0; padding-left: 1.25rem; }
  `
})
export class MenuItemComponent {
  /** El nodo del arbol que este componente dibuja. */
  nodo = input.required<MenuNode>();
}

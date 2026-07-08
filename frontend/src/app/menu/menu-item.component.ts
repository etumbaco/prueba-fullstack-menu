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
      <a [routerLink]="nodo().ruta" routerLinkActive="activo"
         [routerLinkActiveOptions]="{ exact: true }" class="menu-link">
        @if (nodo().icono) {
          <i [class]="nodo().icono"></i>
        } @else {
          <i class="pi pi-circle-fill placeholder"></i>
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
      gap: 0.65rem;
      padding: 0.55rem 0.75rem;
      margin-bottom: 2px;
      border-radius: 8px;
      color: var(--texto);
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 500;
      transition: all 0.15s ease;

      i { font-size: 0.95rem; color: var(--marca-500); width: 18px; text-align: center; }
      i.placeholder { font-size: 0.4rem; color: #cbd5e1; }
    }
    .menu-link:hover {
      background: var(--marca-100);
    }
    .menu-link.activo {
      background: linear-gradient(135deg, var(--marca-500), var(--marca-700));
      color: #fff;
      box-shadow: var(--sombra-sm);
      i { color: #fff; }
      i.placeholder { color: rgba(255,255,255,0.6); }
    }
    .menu-hijos {
      margin: 0;
      padding-left: 1rem;
      border-left: 1px solid var(--borde);
      margin-left: 0.85rem;
    }
  `
})
export class MenuItemComponent {
  /** El nodo del arbol que este componente dibuja. */
  nodo = input.required<MenuNode>();
}

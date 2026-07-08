import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { RolService } from './core/services/rol.service';
import { MenuService } from './core/services/menu.service';
import { Rol } from './core/models/rol.model';
import { MenuNode } from './core/models/menu-node.model';
import { MenuItemComponent } from './menu/menu-item.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, SelectModule, ProgressSpinnerModule, MenuItemComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  private readonly rolService = inject(RolService);
  private readonly menuService = inject(MenuService);

  /** Estado local con Signals (requisito de la prueba). */
  readonly roles = signal<Rol[]>([]);
  readonly rolSeleccionadoId = signal<number | null>(null);
  readonly menu = signal<MenuNode[]>([]);
  readonly cargandoMenu = signal(false);
  readonly errorCarga = signal<string | null>(null);

  constructor() {
    this.cargarRoles();
  }

  private cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: roles => this.roles.set(roles),
      error: () => this.errorCarga.set('No se pudo conectar con el backend')
    });
  }

  seleccionarRol(rolId: number): void {
    this.rolSeleccionadoId.set(rolId);
    this.cargandoMenu.set(true);
    this.errorCarga.set(null);

    this.menuService.obtenerMenuPorRol(rolId).subscribe({
      next: menu => {
        this.menu.set(menu);
        this.cargandoMenu.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el menu');
        this.cargandoMenu.set(false);
      }
    });
  }
}

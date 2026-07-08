import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ModuloService } from '../core/services/modulo.service';
import { RolService } from '../core/services/rol.service';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule],
  template: `
    <div class="dashboard">
      <div class="bienvenida">
        <h2>Panel de administración</h2>
        <p>Gestione los módulos de navegación y los roles del sistema. Seleccione un rol
           en la barra superior para previsualizar su menú.</p>
      </div>

      <div class="tarjetas">
        <div class="tarjeta acento-azul">
          <div class="icono"><i class="pi pi-sitemap"></i></div>
          <div class="datos">
            <span class="numero">{{ totalModulos() }}</span>
            <span class="etiqueta">Módulos configurados</span>
          </div>
        </div>

        <div class="tarjeta acento-ambar">
          <div class="icono"><i class="pi pi-id-card"></i></div>
          <div class="datos">
            <span class="numero">{{ totalRoles() }}</span>
            <span class="etiqueta">Roles definidos</span>
          </div>
        </div>

        <div class="tarjeta acento-verde">
          <div class="icono"><i class="pi pi-share-alt"></i></div>
          <div class="datos">
            <span class="numero">{{ nivelesMax() }}</span>
            <span class="etiqueta">Niveles de anidamiento</span>
          </div>
        </div>
      </div>

      <div class="accesos">
        <h3>Accesos rápidos</h3>
        <div class="enlaces">
          <a class="enlace" href="/administracion/modulos">
            <i class="pi pi-sitemap"></i>
            <div>
              <strong>Gestionar módulos</strong>
              <span>Crear, editar y organizar la jerarquía</span>
            </div>
            <i class="pi pi-chevron-right flecha"></i>
          </a>
          <a class="enlace" href="/administracion/roles">
            <i class="pi pi-id-card"></i>
            <div>
              <strong>Gestionar roles</strong>
              <span>Administrar los perfiles del sistema</span>
            </div>
            <i class="pi pi-chevron-right flecha"></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard { padding: 2rem; max-width: 1100px; }

    .bienvenida {
      margin-bottom: 2rem;
      h2 { font-size: 1.6rem; font-weight: 700; color: var(--marca-900); margin: 0 0 0.5rem; }
      p { color: var(--texto-suave); margin: 0; max-width: 640px; line-height: 1.6; }
    }

    .tarjetas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .tarjeta {
      background: var(--superficie);
      border-radius: var(--radio);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--sombra-sm);
      border-top: 3px solid transparent;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .tarjeta:hover { transform: translateY(-2px); box-shadow: var(--sombra-md); }
    .tarjeta.acento-azul { border-top-color: var(--marca-500); }
    .tarjeta.acento-ambar { border-top-color: var(--acento); }
    .tarjeta.acento-verde { border-top-color: #10b981; }

    .icono {
      width: 52px; height: 52px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
    }
    .acento-azul .icono { background: var(--marca-100); color: var(--marca-700); }
    .acento-ambar .icono { background: #fef3c7; color: #d97706; }
    .acento-verde .icono { background: #d1fae5; color: #059669; }

    .datos { display: flex; flex-direction: column; }
    .numero { font-size: 1.9rem; font-weight: 700; color: var(--texto); line-height: 1; }
    .etiqueta { font-size: 0.85rem; color: var(--texto-suave); margin-top: 0.35rem; }

    .accesos h3 { font-size: 1.1rem; color: var(--marca-900); margin: 0 0 1rem; }
    .enlaces { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .enlace {
      display: flex; align-items: center; gap: 1rem;
      background: var(--superficie); border: 1px solid var(--borde);
      border-radius: var(--radio); padding: 1.1rem 1.25rem;
      text-decoration: none; color: var(--texto);
      transition: all 0.15s ease;

      > i:first-child { font-size: 1.3rem; color: var(--marca-500); }
      div { display: flex; flex-direction: column; flex: 1; }
      strong { font-size: 0.98rem; }
      span { font-size: 0.83rem; color: var(--texto-suave); }
      .flecha { color: var(--texto-suave); font-size: 0.85rem; }
    }
    .enlace:hover {
      border-color: var(--marca-300);
      box-shadow: var(--sombra-sm);
      .flecha { color: var(--marca-500); }
    }
  `
})
export class DashboardComponent {
  private readonly moduloService = inject(ModuloService);
  private readonly rolService = inject(RolService);

  private readonly modulos = signal<{ idModuloPadre: number | null }[]>([]);
  readonly totalRoles = signal(0);
  readonly totalModulos = computed(() => this.modulos().length);
  readonly nivelesMax = signal(0);

  constructor() {
    forkJoin({
      modulos: this.moduloService.listar(),
      roles: this.rolService.listar()
    }).subscribe(({ modulos, roles }) => {
      this.modulos.set(modulos);
      this.totalRoles.set(roles.length);
      this.nivelesMax.set(this.calcularNiveles(modulos));
    });
  }

  /** Calcula la profundidad maxima del arbol a partir de la lista plana. */
  private calcularNiveles(modulos: { id: number; idModuloPadre: number | null }[]): number {
    const porId = new Map(modulos.map(m => [m.id, m]));
    let max = 0;
    for (const m of modulos) {
      let nivel = 1;
      let actual = m;
      const visitados = new Set<number>();
      while (actual.idModuloPadre != null && !visitados.has(actual.id)) {
        visitados.add(actual.id);
        const padre = porId.get(actual.idModuloPadre);
        if (!padre) break;
        actual = padre;
        nivel++;
      }
      if (nivel > max) max = nivel;
    }
    return max;
  }
}

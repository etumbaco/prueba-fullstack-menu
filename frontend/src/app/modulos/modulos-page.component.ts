import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { ModuloService } from '../core/services/modulo.service';
import { RolService } from '../core/services/rol.service';
import { Modulo, ModuloRequest } from '../core/models/modulo.model';
import { Rol } from '../core/models/rol.model';

@Component({
  selector: 'app-modulos-page',
  imports: [
    ReactiveFormsModule, TableModule, DialogModule, ButtonModule, InputTextModule,
    InputNumberModule, SelectModule, MultiSelectModule, ConfirmDialogModule,
    ToastModule, TagModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="pagina">
      <div class="encabezado">
        <h2>Gestión de Módulos</h2>
        <p-button label="Nuevo módulo" icon="pi pi-plus" (onClick)="abrirCrear()" />
      </div>

      <p-table [value]="modulos()" [loading]="cargando()" dataKey="id"
               [paginator]="true" [rows]="10" stripedRows>
        <ng-template #header>
          <tr>
            <th style="width:70px">ID</th>
            <th>Nombre</th>
            <th>Ruta</th>
            <th>Padre</th>
            <th style="width:90px">Orden</th>
            <th>Roles</th>
            <th style="width:140px">Acciones</th>
          </tr>
        </ng-template>
        <ng-template #body let-modulo>
          <tr>
            <td>{{ modulo.id }}</td>
            <td>
              @if (modulo.icono) { <i [class]="modulo.icono"></i> }
              {{ modulo.nombre }}
            </td>
            <td>{{ modulo.ruta }}</td>
            <td>{{ modulo.nombrePadre ?? '— raíz —' }}</td>
            <td>{{ modulo.orden }}</td>
            <td>
              @for (rolId of modulo.rolesIds; track rolId) {
                <p-tag [value]="nombreRol(rolId)" [severity]="severidadRol(rolId)" class="tag-rol" />
              } @empty {
                <span class="sin-roles">Sin roles</span>
              }
            </td>
            <td>
              <p-button icon="pi pi-pencil" severity="secondary" [text]="true"
                        (onClick)="abrirEditar(modulo)" ariaLabel="Editar" />
              <p-button icon="pi pi-trash" severity="danger" [text]="true"
                        (onClick)="confirmarEliminar(modulo)" ariaLabel="Eliminar" />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="7">No hay módulos registrados</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [header]="editandoId() === null ? 'Nuevo módulo' : 'Editar módulo'"
              [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '520px' }" [contentStyle]="{ overflow: 'visible' }" [breakpoints]="{ '640px': '95vw' }">
      <form [formGroup]="form" class="formulario">
        <div class="campo">
          <label for="nombre">Nombre *</label>
          <input pInputText id="nombre" formControlName="nombre" autocomplete="off" />
          @if (form.controls.nombre.invalid && form.controls.nombre.touched) {
            <small class="error">El nombre es obligatorio (máx. 100 caracteres)</small>
          }
        </div>

        <div class="campo">
          <label for="ruta">Ruta *</label>
          <input pInputText id="ruta" formControlName="ruta"
                 placeholder="/ejemplo/ruta" autocomplete="off" />
          @if (form.controls.ruta.invalid && form.controls.ruta.touched) {
            <small class="error">La ruta es obligatoria (máx. 255 caracteres)</small>
          }
        </div>

        <div class="fila">
          <div class="campo">
            <label for="icono">Ícono (PrimeIcons)</label>
            <input pInputText id="icono" formControlName="icono"
                   placeholder="pi pi-home" autocomplete="off" />
          </div>
          <div class="campo">
            <label for="orden">Orden *</label>
            <p-inputNumber fluid inputId="orden" formControlName="orden"
                           [min]="0" [showButtons]="true" />
            @if (form.controls.orden.invalid && form.controls.orden.touched) {
              <small class="error">El orden es obligatorio</small>
            }
          </div>
        </div>

        <div class="campo">
          <label for="padre">Módulo padre</label>
          <p-select inputId="padre" appendTo="body" formControlName="idModuloPadre"
                    [options]="opcionesPadre()" optionLabel="nombre" optionValue="id"
                    placeholder="— módulo raíz —" [showClear]="true" [filter]="true" />
        </div>

        <div class="campo">
          <label for="roles">Roles permitidos</label>
          <p-multiSelect inputId="roles" appendTo="body" formControlName="rolesIds"
                         [options]="roles()" optionLabel="nombre" optionValue="id"
                         placeholder="Seleccione roles" display="chip" />
        </div>
      </form>

      <ng-template #footer>
        <p-button label="Cancelar" severity="secondary" [text]="true"
                  (onClick)="dialogVisible.set(false)" />
        <p-button label="Guardar" icon="pi pi-check"
                  [loading]="guardando()" (onClick)="guardar()" />
      </ng-template>
    </p-dialog>
  `,
  styles: `
    .pagina { padding: 2rem; } :host ::ng-deep .p-datatable { background: var(--superficie); border-radius: var(--radio); box-shadow: var(--sombra-sm); overflow: hidden; }
    .encabezado {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
      h2 { margin: 0; color: var(--marca-900); font-size: 1.5rem; }
    }
    .formulario { display: flex; flex-direction: column; gap: 1rem; }
    .fila { display: flex; gap: 1rem; .campo { flex: 1; min-width: 0; } }
    .campo {
      display: flex; flex-direction: column; gap: 0.35rem;
      label { font-weight: 600; font-size: 0.9rem; }
    }
    .error { color: var(--p-red-500); }
    .tag-rol { margin-right: 0.25rem; }
    .sin-roles { color: var(--p-text-muted-color); font-style: italic; }
  `
})
export class ModulosPageComponent {

  private readonly moduloService = inject(ModuloService);
  private readonly rolService = inject(RolService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly modulos = signal<Modulo[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly dialogVisible = signal(false);
  readonly editandoId = signal<number | null>(null);

  /**
   * Opciones para el selector de padre: todos los modulos
   * excepto el que se esta editando (un modulo no puede ser
   * su propio padre; los ciclos profundos los valida el backend).
   */
  readonly opcionesPadre = computed(() =>
    this.modulos().filter(m => m.id !== this.editandoId())
  );

  readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    ruta: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    icono: this.fb.control<string | null>(null, [Validators.maxLength(50)]),
    orden: this.fb.control<number | null>(0, [Validators.required]),
    idModuloPadre: this.fb.control<number | null>(null),
    rolesIds: this.fb.nonNullable.control<number[]>([])
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      modulos: this.moduloService.listar(),
      roles: this.rolService.listar()
    }).subscribe({
      next: ({ modulos, roles }) => {
        this.modulos.set(modulos);
        this.roles.set(roles);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mostrarError('No se pudieron cargar los datos');
      }
    });
  }

  severidadRol(rolId: number): string {
    const nombre = this.nombreRol(rolId).toLowerCase();
    if (nombre.includes("admin")) return "info";
    if (nombre.includes("supervisor")) return "warn";
    if (nombre.includes("colaborador")) return "success";
    return "secondary";
  }

  nombreRol(rolId: number): string {
    return this.roles().find(r => r.id === rolId)?.nombre ?? `Rol ${rolId}`;
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '', ruta: '', icono: null, orden: 0, idModuloPadre: null, rolesIds: [] });
    this.dialogVisible.set(true);
  }

  abrirEditar(modulo: Modulo): void {
    this.editandoId.set(modulo.id);
    this.form.reset({
      nombre: modulo.nombre,
      ruta: modulo.ruta,
      icono: modulo.icono,
      orden: modulo.orden,
      idModuloPadre: modulo.idModuloPadre,
      rolesIds: [...modulo.rolesIds]
    });
    this.dialogVisible.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: ModuloRequest = {
      nombre: valores.nombre,
      ruta: valores.ruta,
      icono: valores.icono,
      orden: valores.orden ?? 0,
      idModuloPadre: valores.idModuloPadre
    };
    const rolesIds = valores.rolesIds;
    const id = this.editandoId();

    const operacion = id === null
      ? this.moduloService.crear(request)
      : this.moduloService.actualizar(id, request);

    this.guardando.set(true);
    operacion.subscribe({
      next: modulo => this.sincronizarRoles(modulo.id, rolesIds, id === null),
      error: err => {
        this.guardando.set(false);
        this.mostrarError(err?.error?.mensaje ?? 'No se pudo guardar el módulo');
      }
    });
  }

  /** Segundo paso del guardado: asignar los roles seleccionados. */
  private sincronizarRoles(moduloId: number, rolesIds: number[], esNuevo: boolean): void {
    if (rolesIds.length === 0) {
      this.finalizarGuardado(esNuevo);
      return;
    }
    this.moduloService.asignarRoles(moduloId, rolesIds).subscribe({
      next: () => this.finalizarGuardado(esNuevo),
      error: () => {
        this.guardando.set(false);
        this.mostrarError('El módulo se guardó, pero falló la asignación de roles');
        this.cargar();
      }
    });
  }

  private finalizarGuardado(esNuevo: boolean): void {
    this.guardando.set(false);
    this.dialogVisible.set(false);
    this.mostrarExito(esNuevo ? 'Módulo creado' : 'Módulo actualizado');
    this.cargar();
  }

  confirmarEliminar(modulo: Modulo): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el módulo "${modulo.nombre}"? Sus submódulos también se eliminarán.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminar(modulo.id)
    });
  }

  private eliminar(id: number): void {
    this.moduloService.eliminar(id).subscribe({
      next: () => {
        this.mostrarExito('Módulo eliminado');
        this.cargar();
      },
      error: err => this.mostrarError(err?.error?.mensaje ?? 'No se pudo eliminar el módulo')
    });
  }

  private mostrarExito(detalle: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: detalle });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}

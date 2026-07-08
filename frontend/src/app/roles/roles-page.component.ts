import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { RolService } from '../core/services/rol.service';
import { Rol } from '../core/models/rol.model';

@Component({
  selector: 'app-roles-page',
  imports: [
    ReactiveFormsModule, TableModule, DialogModule, ButtonModule,
    InputTextModule, ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="pagina">
      <div class="encabezado">
        <h2>Gestión de Roles</h2>
        <p-button label="Nuevo rol" icon="pi pi-plus" (onClick)="abrirCrear()" />
      </div>

      <p-table [value]="roles()" [loading]="cargando()" dataKey="id"
               [paginator]="true" [rows]="10" stripedRows>
        <ng-template #header>
          <tr>
            <th style="width:80px">ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th style="width:140px">Acciones</th>
          </tr>
        </ng-template>
        <ng-template #body let-rol>
          <tr>
            <td>{{ rol.id }}</td>
            <td>{{ rol.nombre }}</td>
            <td>{{ rol.descripcion }}</td>
            <td>
              <p-button icon="pi pi-pencil" severity="secondary" [text]="true"
                        (onClick)="abrirEditar(rol)" ariaLabel="Editar" />
              <p-button icon="pi pi-trash" severity="danger" [text]="true"
                        (onClick)="confirmarEliminar(rol)" ariaLabel="Eliminar" />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="4">No hay roles registrados</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [header]="editandoId() === null ? 'Nuevo rol' : 'Editar rol'"
              [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '420px' }">
      <form [formGroup]="form" class="formulario">
        <div class="campo">
          <label for="nombre">Nombre *</label>
          <input pInputText id="nombre" formControlName="nombre" autocomplete="off" />
          @if (form.controls.nombre.invalid && form.controls.nombre.touched) {
            <small class="error">
              @if (form.controls.nombre.hasError('required')) { El nombre es obligatorio }
              @else if (form.controls.nombre.hasError('maxlength')) { Máximo 50 caracteres }
            </small>
          }
        </div>

        <div class="campo">
          <label for="descripcion">Descripción</label>
          <input pInputText id="descripcion" formControlName="descripcion" autocomplete="off" />
          @if (form.controls.descripcion.invalid && form.controls.descripcion.touched) {
            <small class="error">Máximo 255 caracteres</small>
          }
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
    .campo {
      display: flex; flex-direction: column; gap: 0.35rem;
      label { font-weight: 600; font-size: 0.9rem; }
    }
    .error { color: var(--p-red-500); }
  `
})
export class RolesPageComponent {

  private readonly rolService = inject(RolService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly roles = signal<Rol[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly dialogVisible = signal(false);
  readonly editandoId = signal<number | null>(null);

  /** Reactive Forms con FormBuilder (requisito de la prueba). */
  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', [Validators.maxLength(255)]]
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.rolService.listar().subscribe({
      next: roles => {
        this.roles.set(roles);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mostrarError('No se pudieron cargar los roles');
      }
    });
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '', descripcion: '' });
    this.dialogVisible.set(true);
  }

  abrirEditar(rol: Rol): void {
    this.editandoId.set(rol.id);
    this.form.reset({ nombre: rol.nombre, descripcion: rol.descripcion ?? '' });
    this.dialogVisible.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();
    const id = this.editandoId();
    const operacion = id === null
      ? this.rolService.crear(request)
      : this.rolService.actualizar(id, request);

    this.guardando.set(true);
    operacion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogVisible.set(false);
        this.mostrarExito(id === null ? 'Rol creado' : 'Rol actualizado');
        this.cargar();
      },
      error: err => {
        this.guardando.set(false);
        this.mostrarError(err?.error?.mensaje ?? 'No se pudo guardar el rol');
      }
    });
  }

  confirmarEliminar(rol: Rol): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el rol "${rol.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminar(rol.id)
    });
  }

  private eliminar(id: number): void {
    this.rolService.eliminar(id).subscribe({
      next: () => {
        this.mostrarExito('Rol eliminado');
        this.cargar();
      },
      error: err => this.mostrarError(err?.error?.mensaje ?? 'No se pudo eliminar el rol')
    });
  }

  private mostrarExito(detalle: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: detalle });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}

export interface Modulo {
  id: number;
  nombre: string;
  ruta: string;
  icono: string | null;
  orden: number;
  idModuloPadre: number | null;
  nombrePadre: string | null;
  rolesIds: number[];
}

export interface ModuloRequest {
  nombre: string;
  ruta: string;
  icono: string | null;
  orden: number;
  idModuloPadre: number | null;
}

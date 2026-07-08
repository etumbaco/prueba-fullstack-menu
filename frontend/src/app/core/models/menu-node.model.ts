export interface MenuNode {
  id: number;
  nombre: string;
  ruta: string;
  icono: string | null;
  hijos: MenuNode[];
}

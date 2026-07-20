export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  activo: boolean;
}

export interface RespuestaPaginada {
  content: Producto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

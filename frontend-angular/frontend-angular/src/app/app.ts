import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Producto } from './models/producto';
import { ProductoService } from './services/producto';

const TAMANIO_PAGINA = 10;

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  usuario = 'admin';
  clave = 'Admin_2026!';
  filtro = '';

  productos: Producto[] = [];
  pagina = 0;
  totalPaginas = 0;
  totalElementos = 0;

  producto: Producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    activo: true,
  };

  editando = false;
  idEditando: number | null = null;
  mensaje = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.listarProductos(0);
  }

  listarProductos(pagina: number): void {
    this.productoService
      .listarPaginado(this.usuario, this.clave, pagina, TAMANIO_PAGINA, this.filtro)
      .subscribe({
        next: (respuesta) => {
          this.productos = respuesta.content;
          this.totalPaginas = respuesta.totalPages;
          this.totalElementos = respuesta.totalElements;
          this.pagina = respuesta.number;
          this.mensaje = `Mostrando página ${this.pagina + 1} de ${this.totalPaginas} (${this.totalElementos} productos activos)`;
        },
        error: (error) => {
          this.manejarError(error);
        },
      });
  }

  buscar(): void {
    this.listarProductos(0);
  }

  paginaAnterior(): void {
    if (this.pagina > 0) {
      this.listarProductos(this.pagina - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.pagina + 1 < this.totalPaginas) {
      this.listarProductos(this.pagina + 1);
    }
  }

  guardarProducto(): void {
    if (this.editando && this.idEditando !== null) {
      this.productoService
        .actualizar(this.idEditando, this.producto, this.usuario, this.clave)
        .subscribe({
          next: () => {
            this.mensaje = 'Producto actualizado correctamente.';
            this.limpiarFormulario();
            this.listarProductos(this.pagina); // misma página
          },
          error: (error) => this.manejarError(error),
        });
    } else {
      this.productoService.crear(this.producto, this.usuario, this.clave).subscribe({
        next: () => {
          this.mensaje = 'Producto registrado correctamente.';
          this.limpiarFormulario();
          this.listarProductos(this.pagina);
        },
        error: (error) => this.manejarError(error),
      });
    }
  }

  editarProducto(producto: Producto): void {
    this.editando = true;
    this.idEditando = producto.id ?? null;

    this.producto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      activo: producto.activo,
    };
  }

  eliminarProducto(id: number | undefined): void {
    if (id === undefined) {
      this.mensaje = 'No se puede eliminar un producto sin id.';
      return;
    }

    const eraUltimoDeSuPagina = this.productos.length === 1 && this.pagina > 0;

    this.productoService.eliminar(id, this.usuario, this.clave).subscribe({
      next: () => {
        this.mensaje = 'Producto eliminado (lógicamente) correctamente.';
        this.listarProductos(eraUltimoDeSuPagina ? this.pagina - 1 : this.pagina);
      },
      error: (error) => this.manejarError(error),
    });
  }

  limpiarFormulario(): void {
    this.editando = false;
    this.idEditando = null;

    this.producto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      activo: true,
    };
  }

  private manejarError(error: any): void {
    if (error.status === 401) {
      this.mensaje = 'Credenciales incorrectas.';
    } else if (error.status === 403) {
      this.mensaje = 'El usuario autenticado requiere rol ADMIN para esta acción.';
    } else if (error.status === 409) {
      this.mensaje = 'Ya existe un producto con ese nombre.';
    } else {
      this.mensaje = error.message || 'Error inesperado.';
    }
  }
}

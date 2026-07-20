<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Producto } from './types/producto'
import {
  listarPaginado,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from './services/productoService'

const TAMANIO_PAGINA = 10

const productoVacio: Producto = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  activo: true,
}

const usuario = ref('admin')
const clave = ref('Admin_2026!')
const filtro = ref('')
const productos = ref<Producto[]>([])
const pagina = ref(0)
const totalPaginas = ref(0)
const totalElementos = ref(0)
const formulario = reactive<Producto>({ ...productoVacio })
const editando = ref(false)
const mensaje = ref('')

onMounted(() => {
  cargarProductos(0)
})

async function cargarProductos(paginaSolicitada: number) {
  try {
    const datos = await listarPaginado(
      usuario.value,
      clave.value,
      paginaSolicitada,
      TAMANIO_PAGINA,
      filtro.value,
    )
    productos.value = datos.content
    totalPaginas.value = datos.totalPages
    totalElementos.value = datos.totalElements
    pagina.value = datos.number
    mensaje.value = `Mostrando página ${pagina.value + 1} de ${totalPaginas.value} (${totalElementos.value} productos activos)`
  } catch (error) {
    manejarError(error)
  }
}

function buscar() {
  cargarProductos(0)
}

function paginaAnterior() {
  if (pagina.value > 0) cargarProductos(pagina.value - 1)
}

function paginaSiguiente() {
  if (pagina.value + 1 < totalPaginas.value) cargarProductos(pagina.value + 1)
}

async function guardar() {
  const producto: Producto = {
    ...formulario,
    precio: Number(formulario.precio),
    stock: Number(formulario.stock),
  }

  try {
    if (editando.value && producto.id) {
      await actualizarProducto(producto.id, producto, usuario.value, clave.value)
      mensaje.value = 'Producto actualizado correctamente.'
    } else {
      await crearProducto(producto, usuario.value, clave.value)
      mensaje.value = 'Producto registrado correctamente.'
    }

    limpiarFormulario()
    await cargarProductos(pagina.value) // misma página
  } catch (error) {
    manejarError(error)
  }
}

function seleccionar(producto: Producto) {
  Object.assign(formulario, producto)
  editando.value = true
}

async function eliminar(producto: Producto) {
  if (producto.id === undefined) {
    mensaje.value = 'No se puede eliminar un producto sin id.'
    return
  }

  try {
    const eraUltimoDeSuPagina = productos.value.length === 1 && pagina.value > 0
    await eliminarProducto(producto.id, usuario.value, clave.value)
    mensaje.value = 'Producto eliminado (lógicamente) correctamente.'
    await cargarProductos(eraUltimoDeSuPagina ? pagina.value - 1 : pagina.value)
  } catch (error) {
    manejarError(error)
  }
}

function limpiarFormulario() {
  Object.assign(formulario, productoVacio)
  editando.value = false
}

function manejarError(error: any) {
  if (error.status === 401) {
    mensaje.value = 'Credenciales incorrectas.'
  } else if (error.status === 403) {
    mensaje.value = 'El usuario autenticado requiere rol ADMIN para esta acción.'
  } else if (error.status === 409) {
    mensaje.value = 'Ya existe un producto con ese nombre.'
  } else {
    mensaje.value = error.message || 'Error inesperado.'
  }
}
</script>

<template>
  <main class="contenedor">
    <h1>CRUD de productos - Vue</h1>

    <section class="tarjeta">
      <h2>Credenciales</h2>
      <label>Usuario</label>
      <input v-model="usuario" />

      <label>Contraseña</label>
      <input type="password" v-model="clave" />
    </section>

    <section class="tarjeta">
      <h2>{{ editando ? 'Editar producto' : 'Registrar producto' }}</h2>

      <form @submit.prevent="guardar">
        <label>Nombre</label>
        <input v-model="formulario.nombre" required />

        <label>Descripción</label>
        <input v-model="formulario.descripcion" required />

        <label>Precio</label>
        <input type="number" v-model.number="formulario.precio" required />

        <label>Stock</label>
        <input type="number" v-model.number="formulario.stock" required />

        <label>
          <input type="checkbox" v-model="formulario.activo" />
          Activo
        </label>

        <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
        <button type="button" @click="limpiarFormulario">Limpiar</button>
      </form>
    </section>

    <section class="tarjeta">
      <h2>Listado de productos (paginado)</h2>
      <input v-model="filtro" placeholder="Buscar por nombre" />
      <button @click="buscar">Buscar</button>

      <p class="mensaje">{{ mensaje }}</p>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.id">
            <td>{{ producto.id }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.precio }}</td>
            <td>{{ producto.stock }}</td>
            <td>{{ producto.activo ? 'Sí' : 'No' }}</td>
            <td>
              <button @click="seleccionar(producto)">Editar</button>
              <button @click="eliminar(producto)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="paginador">
        <button @click="paginaAnterior" :disabled="pagina === 0">Anterior</button>
        <span
          >Página {{ totalPaginas === 0 ? 0 : pagina + 1 }} de {{ totalPaginas }} ({{
            totalElementos
          }}
          productos)</span
        >
        <button @click="paginaSiguiente" :disabled="pagina + 1 >= totalPaginas">Siguiente</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.contenedor {
  max-width: 1100px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}
.tarjeta {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}
label {
  display: block;
  margin-top: 8px;
}
input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  box-sizing: border-box;
}
button {
  margin: 8px 6px 8px 0;
  padding: 8px 12px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
}
.mensaje {
  font-weight: bold;
}
.paginador {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}
</style>

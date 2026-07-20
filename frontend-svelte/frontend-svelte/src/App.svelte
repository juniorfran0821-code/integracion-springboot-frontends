<script>
  import { onMount } from 'svelte'
  /** @typedef {import('./services/productoService').Producto} Producto */

  import {
    listarPaginado,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  } from './services/productoService'

  const TAMANIO_PAGINA = 10

  const productoVacio = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    activo: true,
  }

  let usuario = $state('admin')
  let clave = $state('Admin_2026!')
  let filtro = $state('')

  /** @type {Producto[]} */
  let productos = $state([])

  let pagina = $state(0)
  let totalPaginas = $state(0)
  let totalElementos = $state(0)

  /** @type {Producto} */
  let formulario = $state({ ...productoVacio })

  let editando = $state(false)
  let mensaje = $state('')

  onMount(() => {
    cargarProductos(0)
  })

  /**
   * @param {number} paginaSolicitada
   */
  async function cargarProductos(paginaSolicitada) {
    try {
      const datos = await listarPaginado(usuario, clave, paginaSolicitada, TAMANIO_PAGINA, filtro)
      productos = datos.content
      totalPaginas = datos.totalPages
      totalElementos = datos.totalElements
      pagina = datos.number
      mensaje = `Mostrando página ${pagina + 1} de ${totalPaginas} (${totalElementos} productos activos)`
    } catch (error) {
      manejarError(error)
    }
  }

  function buscar() {
    cargarProductos(0)
  }

  function paginaAnterior() {
    if (pagina > 0) cargarProductos(pagina - 1)
  }

  function paginaSiguiente() {
    if (pagina + 1 < totalPaginas) cargarProductos(pagina + 1)
  }

  /**
   * @param {SubmitEvent} event
   */
  async function guardar(event) {
    event.preventDefault()

    const producto = {
      ...formulario,
      precio: Number(formulario.precio),
      stock: Number(formulario.stock),
    }

    try {
      if (editando && producto.id) {
        await actualizarProducto(producto.id, producto, usuario, clave)
        mensaje = 'Producto actualizado correctamente.'
      } else {
        await crearProducto(producto, usuario, clave)
        mensaje = 'Producto registrado correctamente.'
      }

      limpiarFormulario()
      await cargarProductos(pagina) // misma página
    } catch (error) {
      manejarError(error)
    }
  }

  /**
   * @param {Producto} producto
   */
  function seleccionar(producto) {
    formulario = { ...producto }
    editando = true
  }

  /**
   * @param {Producto} producto
   */
  async function eliminar(producto) {
    if (producto.id === undefined) {
      mensaje = 'No se puede eliminar un producto sin id.'
      return
    }

    try {
      const eraUltimoDeSuPagina = productos.length === 1 && pagina > 0
      await eliminarProducto(producto.id, usuario, clave)
      mensaje = 'Producto eliminado (lógicamente) correctamente.'
      await cargarProductos(eraUltimoDeSuPagina ? pagina - 1 : pagina)
    } catch (error) {
      manejarError(error)
    }
  }

  function limpiarFormulario() {
    formulario = { ...productoVacio }
    editando = false
  }

  /**
   * @param {any} error
   */
  function manejarError(error) {
    if (error.status === 401) {
      mensaje = 'Credenciales incorrectas.'
    } else if (error.status === 403) {
      mensaje = 'El usuario autenticado requiere rol ADMIN para esta acción.'
    } else if (error.status === 409) {
      mensaje = 'Ya existe un producto con ese nombre.'
    } else {
      mensaje = error.message || 'Error inesperado.'
    }
  }
</script>

<main class="contenedor">
  <h1>CRUD de productos - Svelte</h1>

  <section class="tarjeta">
    <h2>Credenciales</h2>
    <label>
      Usuario
      <input bind:value={usuario} />
    </label>

    <label>
      Contraseña
      <input type="password" bind:value={clave} />
    </label>
  </section>

  <section class="tarjeta">
    <h2>{editando ? 'Editar producto' : 'Registrar producto'}</h2>

    <form onsubmit={guardar}>
      <label>
        Nombre
        <input bind:value={formulario.nombre} required />
      </label>

      <label>
        Descripción
        <input bind:value={formulario.descripcion} required />
      </label>

      <label>
        Precio
        <input type="number" bind:value={formulario.precio} required />
      </label>

      <label>
        Stock
        <input type="number" bind:value={formulario.stock} required />
      </label>

      <label>
        <input type="checkbox" bind:checked={formulario.activo} />
        Activo
      </label>

      <button type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
      <button type="button" onclick={limpiarFormulario}>Limpiar</button>
    </form>
  </section>

  <section class="tarjeta">
    <h2>Listado de productos (paginado)</h2>
    <label>
      Buscar
      <input bind:value={filtro} placeholder="Buscar por nombre" />
    </label>
    <button onclick={buscar}>Buscar</button>

    <p class="mensaje">{mensaje}</p>

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
        {#each productos as producto (producto.id)}
          <tr>
            <td>{producto.id}</td>
            <td>{producto.nombre}</td>
            <td>{producto.precio}</td>
            <td>{producto.stock}</td>
            <td>{producto.activo ? 'Sí' : 'No'}</td>
            <td>
              <button onclick={() => seleccionar(producto)}>Editar</button>
              <button onclick={() => eliminar(producto)}>Eliminar</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="paginador">
      <button onclick={paginaAnterior} disabled={pagina === 0}>Anterior</button>
      <span>Página {totalPaginas === 0 ? 0 : pagina + 1} de {totalPaginas} ({totalElementos} productos)</span>
      <button onclick={paginaSiguiente} disabled={pagina + 1 >= totalPaginas}>Siguiente</button>
    </div>
  </section>
</main>

<style>
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
  th, td {
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
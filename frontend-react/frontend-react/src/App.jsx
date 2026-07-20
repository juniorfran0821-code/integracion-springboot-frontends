import { useEffect, useState } from "react";
import "./App.css";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarPaginado,
} from "./services/productoService";

const productoVacio = {
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  activo: true,
};

const TAMANIO_PAGINA = 10;

function App() {
  const [usuario, setUsuario] = useState("admin");
  const [clave, setClave] = useState("Admin_2026!");
  const [filtro, setFiltro] = useState("");
  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [formulario, setFormulario] = useState(productoVacio);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarProductos(pagina);
  }, [pagina]);

  async function cargarProductos(paginaSolicitada = pagina) {
    try {
      const datos = await listarPaginado(
        usuario,
        clave,
        paginaSolicitada,
        TAMANIO_PAGINA,
        filtro,
      );
      setProductos(datos.content);
      setTotalPaginas(datos.totalPages);
      setTotalElementos(datos.totalElements);
      setPagina(datos.number);
      setMensaje(
        `Mostrando página ${datos.number + 1} de ${datos.totalPages} (${datos.totalElements} productos activos)`,
      );
    } catch (error) {
      manejarError(error);
    }
  }

  function buscar() {
    setPagina(0);
    cargarProductos(0);
  }

  function paginaAnterior() {
    if (pagina > 0) setPagina(pagina - 1);
  }

  function paginaSiguiente() {
    if (pagina + 1 < totalPaginas) setPagina(pagina + 1);
  }

  function cambiarCampo(event) {
    const { name, value, type, checked } = event.target;
    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function guardar(event) {
    event.preventDefault();

    const producto = {
      ...formulario,
      precio: Number(formulario.precio),
      stock: Number(formulario.stock),
    };

    try {
      if (editando && producto.id) {
        await actualizarProducto(producto.id, producto, usuario, clave);
        setMensaje("Producto actualizado correctamente.");
        limpiarFormulario();
        await cargarProductos(pagina); // se queda en la MISMA página
      } else {
        await crearProducto(producto, usuario, clave);
        setMensaje("Producto registrado correctamente.");
        limpiarFormulario();
        await cargarProductos(pagina);
      }
    } catch (error) {
      manejarError(error);
    }
  }

  function seleccionar(producto) {
    setFormulario({ ...producto });
    setEditando(true);
  }

  async function eliminar(producto) {
    try {
      await eliminarProducto(producto.id, usuario, clave);
      setMensaje("Producto eliminado (lógicamente) correctamente.");

      const eraUltimoDeSuPagina = productos.length === 1 && pagina > 0;
      await cargarProductos(eraUltimoDeSuPagina ? pagina - 1 : pagina);
    } catch (error) {
      manejarError(error);
    }
  }

  function limpiarFormulario() {
    setFormulario(productoVacio);
    setEditando(false);
  }

  function manejarError(error) {
    if (error.status === 401) {
      setMensaje("Credenciales incorrectas.");
    } else if (error.status === 403) {
      setMensaje("El usuario autenticado requiere rol ADMIN para esta acción.");
    } else if (error.status === 409) {
      setMensaje("Ya existe un producto con ese nombre.");
    } else {
      setMensaje(error.message || "Error inesperado.");
    }
  }

  return (
    <main className="contenedor">
      <h1>CRUD de productos - React</h1>

      <section className="tarjeta">
        <h2>Credenciales</h2>
        <label>Usuario</label>
        <input value={usuario} onChange={(e) => setUsuario(e.target.value)} />

        <label>Contraseña</label>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
      </section>

      <section className="tarjeta">
        <h2>{editando ? "Editar producto" : "Registrar producto"}</h2>

        <form onSubmit={guardar}>
          <label>Nombre</label>
          <input
            name="nombre"
            value={formulario.nombre}
            onChange={cambiarCampo}
            required
          />

          <label>Descripción</label>
          <input
            name="descripcion"
            value={formulario.descripcion}
            onChange={cambiarCampo}
            required
          />

          <label>Precio</label>
          <input
            name="precio"
            type="number"
            value={formulario.precio}
            onChange={cambiarCampo}
            required
          />

          <label>Stock</label>
          <input
            name="stock"
            type="number"
            value={formulario.stock}
            onChange={cambiarCampo}
            required
          />

          <label>
            <input
              name="activo"
              type="checkbox"
              checked={formulario.activo}
              onChange={cambiarCampo}
            />
            Activo
          </label>

          <button type="submit">{editando ? "Actualizar" : "Guardar"}</button>
          <button type="button" onClick={limpiarFormulario}>
            Limpiar
          </button>
        </form>
      </section>

      <section className="tarjeta">
        <h2>Listado de productos (paginado)</h2>
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre"
        />
        <button onClick={buscar}>Buscar</button>

        <p className="mensaje">{mensaje}</p>

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
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>{producto.precio}</td>
                <td>{producto.stock}</td>
                <td>{producto.activo ? "Sí" : "No"}</td>
                <td>
                  <button onClick={() => seleccionar(producto)}>Editar</button>
                  <button onClick={() => eliminar(producto)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="paginador">
          <button onClick={paginaAnterior} disabled={pagina === 0}>
            Anterior
          </button>
          <span>
            Página {totalPaginas === 0 ? 0 : pagina + 1} de {totalPaginas} (
            {totalElementos} productos)
          </span>
          <button
            onClick={paginaSiguiente}
            disabled={pagina + 1 >= totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;

/**
 * @typedef {Object} Producto
 * @property {number} [id]
 * @property {string} nombre
 * @property {string} descripcion
 * @property {number} precio
 * @property {number} stock
 * @property {boolean} activo
 */

/**
 * @typedef {Object} RespuestaPaginada
 * @property {Producto[]} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} number
 * @property {number} size
 */

const API_URL = "http://localhost:8081/api/productos";

/**
 * @param {string} usuario
 * @param {string} clave
 * @returns {string}
 */
function crearAuthorization(usuario, clave) {
  return `Basic ${btoa(`${usuario}:${clave}`)}`;
}

/**
 * @param {Response} response
 */
async function procesarRespuesta(response) {
  if (response.status === 204) return null;

  const texto = await response.text();
  const data = texto ? JSON.parse(texto) : null;

  if (!response.ok) {
    /** @type {Error & { status?: number }} */
    const error = new Error(data?.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * @param {string} usuario
 * @param {string} clave
 * @param {number} page
 * @param {number} size
 * @param {string} [nombre]
 * @returns {Promise<RespuestaPaginada>}
 */
export async function listarPaginado(usuario, clave, page, size, nombre = "") {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (nombre.trim()) params.set("nombre", nombre.trim());

  const response = await fetch(`${API_URL}/paginado?${params}`, {
    headers: { Authorization: crearAuthorization(usuario, clave) },
  });

  return procesarRespuesta(response);
}

/**
 * @param {Producto} producto
 * @param {string} usuario
 * @param {string} clave
 * @returns {Promise<Producto>}
 */
export async function crearProducto(producto, usuario, clave) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: crearAuthorization(usuario, clave),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });
  return procesarRespuesta(response);
}

/**
 * @param {number} id
 * @param {Producto} producto
 * @param {string} usuario
 * @param {string} clave
 * @returns {Promise<Producto>}
 */
export async function actualizarProducto(id, producto, usuario, clave) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: crearAuthorization(usuario, clave),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });
  return procesarRespuesta(response);
}

/**
 * @param {number} id
 * @param {string} usuario
 * @param {string} clave
 * @returns {Promise<void>}
 */
export async function eliminarProducto(id, usuario, clave) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: crearAuthorization(usuario, clave) },
  });
  return procesarRespuesta(response);
}

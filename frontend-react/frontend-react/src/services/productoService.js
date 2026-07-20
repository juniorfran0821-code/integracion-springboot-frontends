const API_URL = "http://localhost:8081/api/productos";

function crearAuthorization(usuario, clave) {
  return `Basic ${btoa(`${usuario}:${clave}`)}`;
}

async function procesarRespuesta(response) {
  if (response.status === 204) return null;

  const texto = await response.text();
  const data = texto ? JSON.parse(texto) : null;

  if (!response.ok) {
    const error = new Error(data?.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function listarPaginado(
  usuario,
  clave,
  page = 0,
  size = 10,
  nombre = "",
) {
  const params = new URLSearchParams({ page, size });
  if (nombre.trim()) params.set("nombre", nombre.trim());

  const response = await fetch(`${API_URL}/paginado?${params}`, {
    headers: { Authorization: crearAuthorization(usuario, clave) },
  });

  return procesarRespuesta(response);
}

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

export async function eliminarProducto(id, usuario, clave) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: crearAuthorization(usuario, clave) },
  });
  return procesarRespuesta(response);
}

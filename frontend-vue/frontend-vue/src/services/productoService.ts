import type { Producto } from '../types/producto'

const API_URL = 'http://localhost:8081/api/productos'

export interface RespuestaPaginada {
  content: Producto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

function crearAuthorization(usuario: string, clave: string): string {
  return `Basic ${btoa(`${usuario}:${clave}`)}`
}

async function procesarRespuesta(response: Response) {
  if (response.status === 204) return null

  const texto = await response.text()
  const data = texto ? JSON.parse(texto) : null

  if (!response.ok) {
    const error: any = new Error(data?.message || `Error HTTP ${response.status}`)
    error.status = response.status
    throw error
  }

  return data
}

export async function listarPaginado(
  usuario: string,
  clave: string,
  page: number,
  size: number,
  nombre = '',
): Promise<RespuestaPaginada> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (nombre.trim()) params.set('nombre', nombre.trim())

  const response = await fetch(`${API_URL}/paginado?${params}`, {
    headers: { Authorization: crearAuthorization(usuario, clave) },
  })

  return procesarRespuesta(response)
}

export async function crearProducto(
  producto: Producto,
  usuario: string,
  clave: string,
): Promise<Producto> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: crearAuthorization(usuario, clave),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producto),
  })
  return procesarRespuesta(response)
}

export async function actualizarProducto(
  id: number,
  producto: Producto,
  usuario: string,
  clave: string,
): Promise<Producto> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: crearAuthorization(usuario, clave),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producto),
  })
  return procesarRespuesta(response)
}

export async function eliminarProducto(id: number, usuario: string, clave: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: crearAuthorization(usuario, clave) },
  })
  return procesarRespuesta(response)
}

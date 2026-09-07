// ==========================================================================
// menu.js — Carga la "base de datos" estática (data/menu.json)
// ==========================================================================

/**
 * Descarga y parsea data/menu.json.
 * @returns {Promise<{moneda:string, simboloMoneda:string, categorias:Array}>}
 */
export async function loadMenu() {
  const response = await fetch("data/menu.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`No se pudo cargar el menú (HTTP ${response.status})`);
  }
  const data = await response.json();

  if (!Array.isArray(data.categorias)) {
    throw new Error("El archivo menu.json no tiene el formato esperado (falta 'categorias').");
  }

  return data;
}

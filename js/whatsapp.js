// ==========================================================================
// whatsapp.js — Construye el mensaje y el enlace de WhatsApp a partir del
// carrito. No depende de ninguna API externa: usa el esquema público
// https://wa.me/<numero>?text=<mensaje-codificado>
// ==========================================================================

/**
 * Formatea un número como moneda simple, ej: 3.5 -> "3.50"
 */
function formatPrice(value) {
  return Number(value).toFixed(2);
}

/**
 * Construye el texto plano del pedido a partir de los items del carrito.
 * @param {Array<{nombre:string, precio:number, cantidad:number}>} items
 * @param {number} total
 * @param {{mensajeSaludo:string, mensajeCierre:string}} config
 * @param {string} simboloMoneda
 */
export function buildOrderMessage(items, total, config, simboloMoneda) {
  const lineas = items.map((item) => {
    const subtotal = formatPrice(item.precio * item.cantidad);
    return `• ${item.cantidad}x ${item.nombre} — ${simboloMoneda}${subtotal}`;
  });

  return [
    config.mensajeSaludo,
    "",
    ...lineas,
    "",
    `Total: ${simboloMoneda}${formatPrice(total)}`,
    "",
    config.mensajeCierre,
  ].join("\n");
}

/**
 * Construye el enlace https://wa.me/... listo para abrir en una pestaña nueva.
 * @param {string} numeroWhatsapp Número en formato internacional sin "+".
 * @param {string} mensaje Texto plano del pedido.
 */
export function buildWhatsAppLink(numeroWhatsapp, mensaje) {
  const numeroLimpio = String(numeroWhatsapp).replace(/[^\d]/g, "");
  const textoCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numeroLimpio}?text=${textoCodificado}`;
}

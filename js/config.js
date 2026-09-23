// ==========================================================================
// CONFIGURACIÓN DE LA TIENDA
// Este es el único archivo que normalmente necesitas editar con los datos
// reales del negocio. No toques el resto de los .js a menos que quieras
// cambiar el comportamiento del sitio.
// ==========================================================================

export const STORE_CONFIG = {
  // Nombre del negocio, se muestra en el header y en el <title>.
  nombreTienda: "Marichef_Cafe",

  // Frase corta debajo del nombre (opcional, puede dejarse como "").
  eslogan: "Desayunos saludables, pedidos por WhatsApp",

  // Número de WhatsApp SIN el símbolo "+", sin espacios ni guiones.
  // Formato: código de país + número. Ejemplo Venezuela: 584121234567
  // ⚠️ Este es un número de EJEMPLO, reemplázalo por el número real
  // de la tienda antes de publicar el sitio.
  whatsappNumero: "584244000634",
  // Cambiar a true solo después de confirmar el número real con la tienda.
  whatsappConfirmado: false,

  // Mensaje que aparece al inicio del pedido enviado por WhatsApp.
  mensajeSaludo: "¡Hola! Quisiera hacer el siguiente pedido:",

  // Mensaje de cierre, después del listado de items y el total.
  mensajeCierre: "¿Podrían confirmarme la disponibilidad y el tiempo de entrega? ¡Gracias!",

  // Símbolo de moneda usado si no viene definido en menu.json.
  simboloMonedaPorDefecto: "$",
};

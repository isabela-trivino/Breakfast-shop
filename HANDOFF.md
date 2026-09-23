# Estado del proyecto — 2026-09-23

## Carpeta y Git

Trabajar directamente en C:\dev\BreakfastShop-GPT, copia independiente del original de Claude. Repositorio inicializado: main, HEAD 0f8a355, origin https://github.com/emilytrivino16-boop/Breakfast-shop.git. Al iniciar solo estaba modificado data/menu.json: cinco rutas cambiadas a placeholder.svg. Se preservó íntegro ese archivo. No se creó otra copia, no hubo git init, commits, push ni publicación.

## Cambios de esta sesión

- Ajuste solicitado: fondo crema claro #FFFCF7 y tarjetas/superficies arena #F4EEE5. Se mantienen los botones jamaica.

- Identidad elegida: Arena y salvia (opción 1), con botones jamaica #873E4C (opción 3), titulares serif, tarjetas y carrito adaptados a móvil. Se mantuvieron datos comerciales de ejemplo.
- Temporizador cancelable evita ocultar un carrito reabierto; fondo inert, foco conservado al cambiar cantidades, Tab y Escape.
- Categoría activa sigue el desplazamiento. Agregar anuncia el producto y los controles incluyen nombres accesibles. Controles >=44 px.
- Productos agotados deshabilitados, imágenes fallidas usan placeholder y error de menú ofrece reintento.
- WhatsApp bloqueado hasta confirmar número: whatsappConfirmado false en config.js. Número guardado 584244000634, todavía de ejemplo.
- Sin versiones manuales de caché: imports nativos, caché HTTP normal y menú no-store. Sin garantía de renovación inmediata; ver README.
- README actualizado. AUDIT.md es una auditoría histórica, no prueba de que todo estuviera resuelto.

## Pruebas realizadas

Edge headless mediante Playwright, tests/browser.cjs: carga de ocho productos, anchos 320/390/768/1440 sin desbordamiento horizontal, controles visibles >=44 x 44, agregar cantidades, total $5.00 y $7.50, eliminar y vaciar, disponibilidad, navegación al desplazarse, Tab/Shift+Tab, Escape, restitución y conservación de foco, cierre/reapertura rápida, error HTTP con reintento. Enlace WhatsApp interceptado con producto y total $3.50; habilitación solo en respuesta de prueba, sin alterar config real ni contactar al número. Sin errores JavaScript en la prueba. Capturas revisadas de escritorio y carrito móvil; imágenes generadas en tests/.

Texto cacao sobre arena: 11.41:1. Texto crema sobre jamaica: 7.27:1; sobre verde oscuro: 6.75:1. Texto cacao sobre salvia: 7.30:1. No equivale a una auditoría integral con lector de pantalla.

## Pendientes reales

Se recibieron y analizaron cinco capturas del perfil y del feed; el usuario eligió la combinación arena/salvia con acento jamaica. Confirmar nombre y eslogan, número WhatsApp, menú, precios, moneda, fotos, logo y metadatos sociales. No inferir identidad comercial definitiva desde el nombre del perfil. Falta probar WhatsApp real en móvil, Safari/iOS y lector de pantalla. No publicar ni hacer push antes de revisión.

## Datos confirmados posteriormente

Nombre confirmado: Marichef_Cafe. Bebidas: Limonada de Coco y Jamaica-Parchita, ambas a $3 y disponibles; reemplazan café, jugo y malta de ejemplo. Quedan siete productos en total; desayunos y dulces siguen pendientes de confirmación. Mockups generados con image_gen incorporados en assets/img/items/limonada-coco-mockup.png y jamaica-parchita-mockup.png, con etiqueta «Imagen ilustrativa». Para fotos reales, sustituir rutas y quitar imagenIlustrativa. Descripciones basadas en el anuncio adjunto. Número de WhatsApp sigue sin confirmar; no se publicó ni se hizo push.

## Desayunos incorporados

Se sustituyeron los cinco alimentos de ejemplo por seis desayunos de las fotos del usuario (dos imágenes duplicadas descartadas). Nombres y descripciones visuales; ingredientes exactos por confirmar. Precios provisionales autorizados: tostada con aguacate $8, sándwich de waffles $10, waffles con huevos $7, waffles con fresas $5, waffles con revuelto y aguacate $9, panquecas con huevos $7. Las dos bebidas se conservan a $3. Total: ocho productos. Imágenes 1200 × 900 WebP con fondo crema/arena editado mediante image_gen; originales y ediciones conservados. Detalles y prompt en assets/img/items/DESAYUNOS.md. No se hizo push ni publicación.

## Actualización: smoothies y recetas

Descripciones corregidas por el usuario: lechuga; jamón (pavo o ahumado) o tocineta. Se quitó «Bebida aparte» de panquecas. La limonada usa ahora una edición de la cuarta foto real recibida. Se añadieron smoothies proteicos de vainilla, fresa y chocolate y smoothies de frutas de fresa, parchita y mora: seis precios pendientes (null), visibles pero no agregables. Primera y segunda foto asignadas provisionalmente a proteico de vainilla y fresa; chocolate y frutas con placeholder hasta contar con fotos. Total 14 productos. Las fotos editadas son 1200 × 900 WebP, conservando originales. Edición generativa puede alterar detalles de etiquetas. Sin push ni publicación.

## Smoothies: precios e imágenes confirmados

Los seis smoothies cuestan $3.50 y ya se pueden agregar al carrito. Cinco mockups nuevos basados en la textura del proteico de fresa: vainilla, chocolate y frutas de fresa, parchita y mora. Rutas terminadas en -mockup.webp, 1200 × 900, con etiqueta Imagen ilustrativa. La foto editada del proteico de fresa se conserva. Limonada de Coco y Jamaica-Parchita siguen a $3. Prueba actualizada: vainilla + mora suman $7 en carrito y mensaje WhatsApp. Sin publicación ni push.

## Publicación autorizada

El usuario autorizó subir esta copia al remoto existente, rama main, con GitHub Pages ya configurado. Se prepara commit de la versión revisada. Las fotos fuente y ediciones PNG quedan locales (ignoradas por Git); se publican los recursos finales utilizados. WhatsApp sigue deshabilitado hasta confirmar el número.

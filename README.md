# BreakfastShop-GPT

Menú estático con HTML, CSS, JavaScript y JSON, sin backend, pagos ni compilación. El carrito vive en memoria: se vacía al recargar. WhatsApp abre el pedido escrito; el cliente debe enviarlo y acordar disponibilidad con la tienda.

## Trabajar en esta copia

Carpeta: C:\dev\BreakfastShop-GPT. Git ya está inicializado, rama main, commit inicial 0f8a355. Remoto: https://github.com/emilytrivino16-boop/Breakfast-shop.git. No ejecutar git init ni reemplazar esta copia. Revisar git status antes de trabajar. No publicar ni hacer push sin revisión del usuario.

## Vista local

Desde PowerShell en esta carpeta, si tienes Python instalado:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abre http://127.0.0.1:8000. También puedes usar Live Server de VS Code. No abras index.html con doble clic: fetch necesita HTTP.

## Editar contenido

- js/config.js: nombre, eslogan, saludo, cierre y número internacional sin + ni separadores. El número actual 584244000634 está marcado como ejemplo, NO confirmado. Una vez confirmado y corregido, cambia whatsappConfirmado a true para habilitar el botón.
- data/menu.json: categorías e identificadores únicos; precio numérico sin símbolo, disponible true o false, nombre, descripción y ruta de imagen. Conservar moneda y simboloMoneda coherentes. Validar el JSON después de editarlo; no admite comentarios ni comas finales.
- assets/img/items/: fotografías. Respetar mayúsculas de las rutas. Cinco productos conservan placeholder.svg para no mostrar una foto incorrecta.
- css/styles.css: paleta en :root y ajustes visuales. Titulares Georgia y texto de interfaz del sistema, sin fuentes externas.
- index.html: revisar también título inicial, textos de respaldo, metadatos sociales y theme-color al confirmar la identidad. Reemplazar logo, favicon y og-image.png de ejemplo; para compartir usar la URL pública absoluta de la imagen social cuando se conozca.

## Paleta elegida

Tras revisar cinco capturas de Instagram, el usuario eligió Arena y salvia (opción 1) con el botón jamaica de la opción 3. Son tonos adaptados para la web, no colores oficiales extraídos de una guía de marca. Jamaica se reserva para Agregar y Ver pedido; las categorías activas usan salvia suave. WhatsApp conserva verde oscuro.

| Función | Color |
| --- | --- |
| Fondo crema claro | #FFFCF7 |
| Tarjetas y superficies arena | #F4EEE5 |
| Texto cacao | #392E28 |
| Texto secundario | #65564C |
| Botones y acento jamaica | #873E4C |
| Botón presionado | #6D303C |
| WhatsApp y foco salvia oscuro | #496044 |
| Categoría activa salvia | #B9C5AC |
| Bordes y superficies neutras | #DED1BF |
| No disponible / eliminar | #963B33 |

Texto cacao sobre arena: 11.41:1. Texto crema sobre jamaica: 7.27:1; sobre verde oscuro: 6.75:1. Texto cacao sobre salvia: 7.30:1. Los estados también usan texto, no solo color.

## Caché y publicación

Se eliminaron ?v=4 y APP_VERSION: imports nativos y enlaces normales, sin valores que sincronizar ni sistema de build. CSS, HTML y JavaScript usan la caché HTTP normal del alojamiento; esto NO garantiza actualización inmediata del HTML ni de los módulos. El menú se solicita con cache: no-store, aunque una pestaña abierta no actualiza su menú automáticamente.

Después de una publicación autorizada, recargar con Ctrl+F5 y comprobar también una sesión privada. Las pestañas antiguas deben recargarse. No hay service worker. Si se necesita garantizar versiones atómicas para muchos clientes, habrá que incorporar archivos con hash y un proceso de publicación; no se añadió esa complejidad ahora.

Este repositorio ya tiene remoto. Antes de publicar, revisar git diff, confirmar datos comerciales y probar. Después de autorización se podrán guardar y enviar los cambios al remoto existente y configurar Pages para main y la raíz. Un push a una rama conectada a Pages puede publicar: no hacerlo como simple prueba.

## Verificación reproducible

Prueba opcional de desarrollo en tests/browser.cjs (no es necesaria para servir el sitio). Requiere Node, Playwright y Edge instalados; no añade dependencias al sitio. Ejecutar node tests/browser.cjs si Playwright está disponible; alternativamente definir PLAYWRIGHT_MODULE con su ruta absoluta. BROWSER_CHANNEL permite elegir otro canal instalado.

Comprueba 320/390/768/1440 px, JSON, cantidades, total, agotados, foco y Tab, Escape, cierre/reapertura, navegación por desplazamiento, controles táctiles, carrito vacío, fallo de carga y enlace de WhatsApp interceptado. Genera capturas en tests/. No envía mensajes. Probar aparte en un teléfono real y con el número confirmado antes de publicar.

## Actualización de contenido

Nombre confirmado: Marichef_Cafe. Bebidas: Limonada de Coco y Jamaica-Parchita, ambas a $3 y disponibles; reemplazan café, jugo y malta de ejemplo. Quedan siete productos en total; desayunos y dulces siguen pendientes de confirmación. Mockups generados con image_gen incorporados en assets/img/items/limonada-coco-mockup.png y jamaica-parchita-mockup.png, con etiqueta «Imagen ilustrativa». Para fotos reales, sustituir rutas y quitar imagenIlustrativa. Descripciones basadas en el anuncio adjunto. Número de WhatsApp sigue sin confirmar; no se publicó ni se hizo push.

## Desayunos incorporados

Se sustituyeron los cinco alimentos de ejemplo por seis desayunos de las fotos del usuario (dos imágenes duplicadas descartadas). Nombres y descripciones visuales; ingredientes exactos por confirmar. Precios provisionales autorizados: tostada con aguacate $8, sándwich de waffles $10, waffles con huevos $7, waffles con fresas $5, waffles con revuelto y aguacate $9, panquecas con huevos $7. Las dos bebidas se conservan a $3. Total: ocho productos. Imágenes 1200 × 900 WebP con fondo crema/arena editado mediante image_gen; originales y ediciones conservados. Detalles y prompt en assets/img/items/DESAYUNOS.md. No se hizo push ni publicación.

## Actualización: smoothies y recetas

Descripciones corregidas por el usuario: lechuga; jamón (pavo o ahumado) o tocineta. Se quitó «Bebida aparte» de panquecas. La limonada usa ahora una edición de la cuarta foto real recibida. Se añadieron smoothies proteicos de vainilla, fresa y chocolate y smoothies de frutas de fresa, parchita y mora: seis precios pendientes (null), visibles pero no agregables. Primera y segunda foto asignadas provisionalmente a proteico de vainilla y fresa; chocolate y frutas con placeholder hasta contar con fotos. Total 14 productos. Las fotos editadas son 1200 × 900 WebP, conservando originales. Edición generativa puede alterar detalles de etiquetas. Sin push ni publicación.

## Smoothies: precios e imágenes confirmados

Los seis smoothies cuestan $3.50 y ya se pueden agregar al carrito. Cinco mockups nuevos basados en la textura del proteico de fresa: vainilla, chocolate y frutas de fresa, parchita y mora. Rutas terminadas en -mockup.webp, 1200 × 900, con etiqueta Imagen ilustrativa. La foto editada del proteico de fresa se conserva. Limonada de Coco y Jamaica-Parchita siguen a $3. Prueba actualizada: vainilla + mora suman $7 en carrito y mensaje WhatsApp. Sin publicación ni push.

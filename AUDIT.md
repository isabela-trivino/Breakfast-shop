# Auditoría — Tiendita de Desayunos CL

**Skills usados como criterio** (leídos completos, en este orden):
1. `impeccable` — SKILL.md + `reference/audit.md` (checklist técnico: a11y, performance, theming, responsive, integridad de implementación).
2. `emil-design-eng` — filosofía de Emil Kowalski sobre microinteracciones, easing, feedback táctil y animación con propósito.
3. `design-taste-frontend` — skill "anti-slop" de taste frontend (leído completo, ~88KB): tipografía, color, densidad de contenido, iconografía, estados de UI, AI-tells.

**Qué se auditó:** `index.html`, `css/styles.css`, `js/app.js`, `js/config.js`, `data/menu.json` tal como están hoy en `C:\dev\tiendita-desayunos-CL`. No se tocó ningún archivo del proyecto; esto es solo diagnóstico. No se evaluó `menu.js`, `cart.js` ni `whatsapp.js` (no estaban en el alcance de esta auditoría). Por instrucción explícita, no se reportan como hallazgos la falta de paleta/tipografía final ni los datos de ejemplo del menú/WhatsApp: son placeholders intencionales de esta etapa.

Total de hallazgos: **16**, ordenados de mayor a menor impacto.

---

## Hallazgos

### 1. [Alto] El carrito se abre solo en cada clic de "Agregar", interrumpiendo la navegación
- **Motivado por:** `emil-design-eng` (feedback debe ser proporcional a la acción; no todo cambio de estado necesita un panel completo) y `design-taste-frontend` §4.5 (estados táctiles deben confirmar sin secuestrar el flujo).
- **Dónde:** `js/app.js` líneas 140-145, dentro del listener de `addBtn`: `cart.addItem(item, cantidad); ... openCartPanel();`.
- **Por qué importa:** si un usuario agrega 3 items de categorías distintas, el drawer del carrito se despliega 3 veces seguidas, obligándolo a cerrarlo cada vez para seguir viendo el menú. Es la fricción más grande de toda la interfaz y ocurre en el flujo principal (agregar productos).
- **Sugerencia:** reemplazar el `openCartPanel()` automático por una confirmación liviana (por ejemplo, un pulso/bump en `cart-fab-count` o un toast breve "Agregado"), y dejar que el usuario abra el carrito cuando quiera con el FAB.

### 2. [Alto] El diálogo del carrito no maneja foco de teclado (viola WCAG 2.1 AA para modales)
- **Motivado por:** `impeccable/reference/audit.md` dimensión 1 (Accesibilidad): "Keyboard navigation: Missing focus indicators, illogical tab order, keyboard traps".
- **Dónde:** `index.html` líneas 61-68 (`role="dialog" aria-modal="true"`); `js/app.js` `openCartPanel()` líneas 164-168 y `closeCartPanel()` líneas 170-174; `wireCartPanelEvents()` líneas 157-162 solo registra listeners de `click` (fab, close, overlay, whatsapp), no hay ningún listener de `keydown` en todo el archivo.
- **Por qué importa:** un `aria-modal="true"` promete a los lectores de pantalla que el foco queda contenido en el diálogo, pero aquí: (a) al abrir, el foco no se mueve dentro del panel; (b) no hay trampa de foco (Tab puede escaparse al contenido de fondo); (c) no existe atajo Escape para cerrar; (d) al cerrar, el foco no vuelve al botón que abrió el panel. Un usuario de teclado o lector de pantalla puede quedar perdido o interactuar con contenido oculto detrás del overlay.
- **Sugerencia:** al abrir, mover el foco al primer elemento interactivo del panel (o al título); implementar un `keydown` que cierre con Escape y cicle el Tab dentro del panel; al cerrar, devolver el foco al elemento que abrió el diálogo (el FAB o el botón "Agregar" que lo disparó).

### 3. [Alto] La navegación por categorías se rompe contra el header sticky (falta `scroll-margin-top`)
- **Motivado por:** `impeccable/reference/audit.md` (Implementation Integrity: comportamiento que no coincide con lo que el HTML promete) y taste general de navegación.
- **Dónde:** `css/styles.css` — `.category-nav` es `position: sticky; top: 0;` (líneas 85-91); las secciones destino `.menu-section` (línea 121) no tienen `scroll-margin-top` en ninguna parte del archivo (confirmado, no aparece la propiedad en todo `styles.css`).
- **Por qué importa:** los botones de categoría son enlaces `<a href="#cat-...">` (`js/app.js` línea 84). Al hacer clic, el navegador desplaza el título de la sección justo al borde superior del viewport, que es exactamente donde vive la barra de categorías sticky — el título de la sección queda tapado o cortado por la propia barra que se usó para navegar hasta ahí. Es el mecanismo principal de navegación del menú y está roto.
- **Sugerencia:** agregar `scroll-margin-top: calc(<alto real de .category-nav> + espacio)` a `.menu-section` (o a los `h2.menu-section-title`), y de paso `scroll-behavior: smooth` en `html` para que el salto sea menos brusco.

### 4. [Alto] Cero transiciones/feedback de interacción en todo el sitio
- **Motivado por:** `emil-design-eng` en su totalidad (el skill completo trata sobre esto: "Buttons must feel responsive", `transition: transform 160ms ease-out` + `:active { transform: scale(0.97) }`, animar aparición/desaparición de paneles en vez de un corte duro).
- **Dónde:** `css/styles.css` completo — no existe una sola declaración `transition` en las 311 líneas del archivo. `.add-button:active` (línea 180) solo cambia `background`, sin `transform`. `.qty-btn`, `.category-nav-button`, `.cart-fab`, `.whatsapp-button` no tienen `:hover` ni `:active` definidos. El panel del carrito (`.cart-panel`, `.cart-overlay`) aparece/desaparece con el atributo `hidden`: sin fade ni slide, un corte instantáneo.
- **Por qué importa:** ningún botón del sitio da la sensación de "escuchar" al usuario al presionarlo, y el panel lateral del carrito —el componente más visible de la interacción— aparece de golpe en vez de deslizarse desde el borde donde vive. Es exactamente el tipo de detalle invisible-pero-acumulativo que el skill de Emil identifica como diferenciador de producto.
- **Sugerencia:** agregar `transition: transform 150-200ms ease-out` + `:active{transform:scale(0.97)}` a todos los botones interactivos; animar `.cart-panel` con `transform: translateX(100%) → translateX(0)` (~250ms, easing tipo `cubic-bezier(0.23,1,0.32,1)`) y `.cart-overlay` con fade de opacidad; respetar `prefers-reduced-motion` degradando a solo opacidad.

### 5. [Alto] Objetivos táctiles por debajo de 44×44px en varios controles
- **Motivado por:** `impeccable/reference/audit.md` dimensión 4 (Responsive Design): "Touch targets: Interactive elements < 44x44px".
- **Dónde:** `css/styles.css` — `.qty-btn { width: 28px; height: 28px; }` (líneas 163-169); `.icon-button { background: transparent; border: none; font-size: 1.1rem; }` (línea 233, sin padding ni tamaño mínimo — es el botón de cerrar el carrito); `.cart-item-remove { background: transparent; border: none; color: var(--color-danger); }` (línea 243, mismo problema).
- **Por qué importa:** el stepper de cantidad (+/-) aparece dos veces por tarjeta de producto y dos veces por fila del carrito — es de los controles más usados del flujo de compra, y a 28px queda muy por debajo del mínimo táctil recomendado (44px), justo en un proyecto donde ya se invirtió esfuerzo en probar la responsividad a 320/375/390px.
- **Sugerencia:** subir `.qty-btn` a al menos 40-44px de lado (o mantener el tamaño visual y ampliar el área clicable con `padding`/pseudo-elemento invisible), y dar `min-width`/`min-height: 44px` explícitos a `.icon-button` y `.cart-item-remove`.

### 6. [Medio] Iconografía inconsistente: emoji + glifo Unicode mezclados con un SVG real
- **Motivado por:** `design-taste-frontend` §3.C ("One family per project", nada de SVG a mano) y §3.D (Política de Emoji: "discouraged by default... solo si el brief pide explícitamente un tono playful/social").
- **Dónde:** `index.html` línea 54 (`<span class="cart-fab-icon" aria-hidden="true">🛒</span>`), línea 71 (`✕` como contenido del botón de cerrar) y línea 141 en el template (`✕` en `cart-item-remove`), contra línea 87 (`<img src="assets/icons/whatsapp.svg" .../>`) que sí usa un SVG real.
- **Por qué importa:** el ícono principal del carrito (🛒) es un emoji que se renderiza distinto en Windows/Android/iOS/Mac (peso, color y proporción cambian entre plataformas), mientras el botón de WhatsApp usa un SVG consistente. Cuando llegue el rediseño de marca, esta mezcla va a chocar visualmente y va a ser más difícil de re-tematizar (un emoji no hereda `currentColor`).
- **Sugerencia:** reemplazar 🛒 y ✕ por SVGs inline o de una sola librería de íconos (coherente con `whatsapp.svg` ya usado), manteniendo los `aria-label` existentes.

### 7. [Medio] `aria-current` de la navegación por categorías nunca se actualiza
- **Dónde:** `js/app.js` línea 87: `navBtn.setAttribute("aria-current", index === 0 ? "true" : "false");` se ejecuta una sola vez en `renderMenu()`. No hay ningún listener de `click` ni observer de scroll que actualice este atributo después del render inicial.
- **Por qué importa:** `css/styles.css` líneas 112-116 usan `[aria-current="true"]` para resaltar visualmente la categoría activa. En la práctica, el pill de "Desayunos Clásicos" queda marcado como activo para siempre, sin importar a qué sección haga clic o scroll el usuario — la jerarquía visual de "dónde estoy" dentro del menú es engañosa desde el segundo clic.
- **Sugerencia:** agregar un listener de `click` en los botones de categoría (o un `IntersectionObserver` sobre las secciones) que actualice `aria-current` según la sección visible/activa.

### 8. [Medio] El fondo de la página sigue haciendo scroll detrás del carrito abierto
- **Dónde:** `js/app.js` `openCartPanel()`/`closeCartPanel()` (líneas 164-174) solo alternan `hidden` en `cart-panel` y `cart-overlay`; no hay ningún `document.body.style.overflow` ni clase equivalente en todo el archivo ni en `styles.css`.
- **Por qué importa:** con el panel abierto (especialmente en mobile, donde ocupa el 100% del ancho), el contenido detrás del overlay sigue siendo scrolleable con touch, produciendo el clásico "doble scroll" desorientador de los bottom-sheets/drawers mal implementados.
- **Sugerencia:** al abrir el panel, bloquear el scroll del body (`overflow: hidden` o `position: fixed` con restauración de la posición); revertir al cerrar.

### 9. [Medio] Valores de color hard-codeados fuera del sistema de tokens que el propio archivo promete
- **Motivado por:** `impeccable/reference/audit.md` dimensión 3 (Theming): "Hard-coded colors: Colors not using design tokens".
- **Dónde:** el comentario de cabecera de `css/styles.css` (líneas 1-7) dice explícitamente que los colores están "centralizados en variables CSS... para que sea fácil restyling desde Claude Design sin tocar la lógica". Sin embargo `color: #fff` aparece hard-codeado en `.category-nav-button[aria-current="true"]` (línea 115), `.add-button` (línea 175), `.cart-fab` (línea 192) y `.whatsapp-button` (línea 259); además `rgba(255,255,255,0.25)` en `.cart-fab-count` (línea 200) y `rgba(0,0,0,0.4)` en `.cart-overlay` (línea 211) no están tokenizados (a diferencia de `--shadow-card`/`--shadow-panel`, que sí lo están).
- **Por qué importa:** cuando llegue el rediseño de paleta, cualquiera de estos 6 lugares puede quedar con texto blanco sobre un color final que no tenga suficiente contraste, y habrá que revisarlos uno por uno a mano en vez de cambiar un solo token — justo lo que el comentario del archivo dice que se quiso evitar.
- **Sugerencia:** agregar tokens como `--color-on-primary`, `--color-on-accent`, `--color-overlay` y `--color-fab-count-bg` en `:root`, y reemplazar los valores literales por `var(...)`.

### 10. [Medio] Sin metadatos Open Graph para compartir el link, en un producto que vive de compartir links por WhatsApp
- **Dónde:** `index.html` `<head>` (líneas 3-13) tiene `charset`, `viewport`, `title`, `meta description`, favicon y el stylesheet — pero ningún `og:title`, `og:description`, `og:image` ni `twitter:card`.
- **Por qué importa:** este es un caso donde el hallazgo es específico al negocio: el propio modelo de la tienda depende de que el link del sitio se comparta por WhatsApp (a clientes, en el estado del negocio, etc.). Sin OG tags, ese link aparece como texto plano sin preview al pegarse en WhatsApp, perdiendo la oportunidad de mostrar una imagen/nombre atractivo justo en el canal que el producto usa para todo.
- **Sugerencia:** agregar `og:title`, `og:description` (puede reusar el `meta description` existente) y `og:image` apuntando a un asset del logo/hero; opcionalmente `twitter:card=summary_large_image`.

### 11. [Medio] El stepper de cantidad no anuncia su valor a lectores de pantalla
- **Dónde:** `index.html` templates líneas 114-118 y 135-139: `qty-value` es un `<span>` de solo texto, sin `aria-live`, `role="spinbutton"` ni `aria-valuenow`. `js/app.js` líneas 132-139 y 203-208 solo actualizan `textContent` visualmente.
- **Por qué importa:** un usuario de lector de pantalla que presiona +/- no recibe ninguna confirmación de que la cantidad cambió (de 1 a 2, por ejemplo) salvo que vuelva a enfocar el `span`, que además no es normalmente anunciable porque no es focoable ni tiene rol semántico de valor.
- **Sugerencia:** envolver el stepper con `role="group"` + `aria-label` descriptivo, y dar a `qty-value` `aria-live="polite"` (o usar un `<input type="number">` visualmente estilizado con `aria-valuenow`/`aria-valuemin`).

### 12. [Medio] Etiquetas ARIA genéricas no distinguen entre items cuando hay varios en el carrito
- **Dónde:** `index.html` template de carrito, líneas 136-141: `aria-label="Quitar uno"`, `aria-label="Agregar uno"`, `aria-label="Quitar item"` son fijas en el HTML; `js/app.js` `renderCart()` (líneas 191-214) clona el template por cada item pero nunca sobreescribe esos `aria-label` con el nombre del producto.
- **Por qué importa:** con 3+ productos en el carrito, un usuario de lector de pantalla que navega por botones escucha "Quitar item", "Quitar item", "Quitar item" repetido sin saber a cuál producto corresponde cada uno hasta que retrocede a leer el contexto.
- **Sugerencia:** en `renderCart()`, setear `aria-label` dinámico, p. ej. `Quitar ${item.nombre} del carrito`, `Agregar uno más de ${item.nombre}`, etc.

### 13. [Bajo] El estado de carga es solo texto plano, no un esqueleto del layout final
- **Motivado por:** `design-taste-frontend` §4.5 ("Loading: Skeletal loaders matching the final layout's shape. Avoid generic circular spinners").
- **Dónde:** `index.html` línea 38: `<p id="menu-status" ... role="status">Cargando menú…</p>`.
- **Por qué importa:** es funcional y accesible (buen uso de `role="status"`), pero deja la pantalla vacía mientras el `fetch` del menú resuelve. Un esqueleto con la forma de las tarjetas (`menu-item`) mejora la performance percibida, sobre todo en conexiones lentas.
- **Sugerencia:** reemplazar el texto por 3-4 tarjetas "skeleton" (rectángulos grises con shimmer sutil) del mismo tamaño que `.menu-item`, manteniendo `role="status"` con texto accesible oculto visualmente (`sr-only`) para quien use lector de pantalla.

### 14. [Bajo] Sin pista visual de que la barra de categorías se puede scrollear horizontalmente
- **Dónde:** `css/styles.css` líneas 92-102: `.category-nav-inner { overflow-x: auto; ...; scrollbar-width: none; ...}` — la barra de scroll está deliberadamente oculta, pero no hay ningún gradiente/máscara en los bordes que indique que hay más categorías fuera de vista.
- **Por qué importa:** con 4 o más categorías (o en viewports angostos), un usuario puede no darse cuenta de que puede deslizar la barra para ver más opciones, y asumir que el menú visible es todo lo que hay.
- **Sugerencia:** agregar un `mask-image`/gradiente de opacidad en los bordes izquierdo/derecho de `.category-nav-inner` que aparezca solo cuando hay contenido oculto (se puede togglear con JS al detectar `scrollLeft`/`scrollWidth`).

### 15. [Bajo] Versionado de caché manual repartido en 6 lugares, propenso a error
- **Motivado por:** `impeccable/reference/audit.md` dimensión 5 (Implementation Integrity).
- **Dónde:** `index.html` líneas 9-11 (comentario) y línea 12 (`?v=3` en el `<link>`) y línea 146 (`?v=3` en el `<script>`); `js/app.js` líneas 4-11 (comentario) y las 4 líneas de `import` (13-16), cada una con su propio `?v=3`.
- **Por qué importa:** el propio comentario del código admite el riesgo ("sube el número de versión en TODOS estos lugares a la vez"). Son 6 sitios distintos a mantener sincronizados a mano; olvidar uno solo produce que ese archivo específico quede cacheado con una versión vieja en los navegadores de los usuarios, un bug silencioso y difícil de diagnosticar remotamente.
- **Sugerencia:** centralizar el número de versión en una sola constante (por ejemplo inyectada en build, o leída de un único `<meta name="app-version">` que JS use para construir las URLs de los imports), o migrar a un hash de contenido si en algún momento se introduce un paso de build.

### 16. [Bajo] Sin `theme-color` para el navegador en mobile
- **Dónde:** `index.html` `<head>` (líneas 3-13) no tiene `<meta name="theme-color">`.
- **Por qué importa:** en Chrome/Android, la barra de estado y la UI del navegador quedan con el gris por defecto en vez de adoptar el color de marca, un detalle menor pero de costo casi nulo que suma a la sensación de app cuidada.
- **Sugerencia:** agregar `<meta name="theme-color" content="var equivalente a --color-primary en hex">` (y actualizarlo cuando llegue la paleta final).

---

## Quick wins (bajo esfuerzo, alto impacto)

1. **Fix de una línea para la navegación por categorías:** agregar `scroll-margin-top` a `.menu-section` en `styles.css` — resuelve el hallazgo #3 sin tocar JS.
2. **Feedback táctil en botones:** agregar `transition: transform 150ms ease-out; } :active { transform: scale(0.97); }` a `.add-button`, `.qty-btn`, `.cart-fab`, `.whatsapp-button` y `.category-nav-button` — resuelve gran parte del hallazgo #4 en minutos.
3. **Dejar de abrir el carrito automáticamente al agregar un item** (hallazgo #1) — quitar la llamada a `openCartPanel()` en el listener de `addBtn` en `js/app.js` línea 144; reemplazar por un pulso visual en `cart-fab-count`.
4. **Meta tags de Open Graph** (hallazgo #10) — 3 líneas en el `<head>` de `index.html`, alto valor dado que el producto se comparte por WhatsApp.
5. **`theme-color`** (hallazgo #16) — una línea, costo casi cero.

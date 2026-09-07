# HANDOFF.md — Estado del proyecto

Última actualización: 2026-09-02. Objetivo de este archivo: que una sesión
nueva de Claude pueda seguir trabajando sin que el usuario tenga que
recontar toda la conversación. Actualízalo al final de cada sesión con lo
que cambió y lo que quedó pendiente.

## Resumen de una línea

Sitio estático de menú + pedido por WhatsApp para una tiendita de
desayunos, funcional de punta a punta con datos de ejemplo, responsivo,
todavía sin diseño visual final ni datos reales del negocio.

## Dónde vive el proyecto

Carpeta del usuario en su computadora (Windows), conectada por el puente de
Cowork: `C:\dev\tiendita-desayunos-CL`. No hay acceso a shell/terminal en
esa computadora desde esta sesión — solo lectura/escritura de archivos
(`device_list_dir` / `device_stage_files` / `device_commit_files`).

## Qué está hecho

- Estructura completa del sitio: `index.html`, `css/styles.css`,
  `js/{app,config,cart,menu,whatsapp}.js`, `data/menu.json`, `assets/`.
  Ver `CLAUDE.md` para el mapa de archivos y las convenciones.
- Flujo funcional probado de punta a punta: carga de `menu.json`, agregar
  items al carrito, armar mensaje y abrir `wa.me` con el pedido y el total.
- Diseño responsivo para teléfono: header compacto, categorías en carrusel
  horizontal (con la barra de scroll nativa oculta vía CSS), grid de menú a
  una columna, panel de carrito a ancho completo, botón flotante reducido a
  ícono+contador en pantallas chicas, soporte de `safe-area-inset` para el
  notch/barra inferior de iPhone. Verificado con Playwright en 320px, 375px
  (iPhone SE) y 390px (iPhone 12).
- Versionado de caché: `index.html` y los imports de `js/app.js` usan
  `?v=3` en todas las referencias a `styles.css` y a los `.js`. Ver la
  sección correspondiente en `CLAUDE.md` antes de publicar cualquier cambio
  de CSS/JS — hay que subir el número en todos los lugares a la vez.
- `.gitignore` creado. **`.git` NO está inicializado** en
  `C:\dev\tiendita-desayunos-CL` (se verificó listando la carpeta). El único
  `git init`/commit que se hizo fue dentro del entorno de trabajo en la nube
  de Claude, como prueba de que los comandos corren limpios — no tiene
  ningún efecto sobre la carpeta real del usuario. **Nadie ha corrido git
  todavía en la carpeta real.**

## Qué falta / pendiente

1. **Datos reales del negocio**: `js/config.js` sigue con un número de
   WhatsApp de ejemplo (`584120000000`) y `data/menu.json` con items
   placeholder (arepas, café, etc.). El usuario dijo que los va a
   reemplazar él mismo y que avisaría cuando estuvieran listos para
   revisar — no ha avisado todavía a la fecha de este handoff.
2. **Git / publicación en GitHub Pages**: nadie ha corrido `git init` en la
   carpeta real del usuario. Los pasos exactos están en `README.md` sección
   4. Si el usuario pide ayuda para esto y no hay shell disponible en su
   computadora, hay que darle los comandos para que los corra él mismo.
3. **Diseño visual**: `css/styles.css` sigue siendo una base funcional, no
   el diseño final (colores/tipografía en `:root` son placeholder a
   propósito). El plan original era preparar un `.md` de instrucciones para
   que Claude Design definiera la identidad visual — todavía no se ha hecho.
4. ~~Aplicar los hallazgos de `AUDIT.md`~~ — **hecho** (ver sección de
   abajo). El usuario eligió implementar los 16 completos, no solo los
   quick wins.

## Skills de terceros instaladas por el usuario (inventario + auditoría)

El usuario instaló un paquete grande de skills de terceros directamente en
la carpeta del proyecto (no son skills nativas de esta sesión de Cowork —
hay que leerlas del disco). Están replicadas en tres ubicaciones con el
mismo contenido, para compatibilidad con distintas herramientas de agente:
`.claude/skills/`, `.agents/skills/`, `.agent/skills/` (24+ carpetas de
skills en total, no solo 3).

**Ya resuelto**: se le preguntó al usuario cuál de las 4 skills de "taste"
usar (`design-taste-frontend`, `design-taste-frontend-v1`, `gpt-taste`,
`stitch-design-taste`) y eligió **`design-taste-frontend`**
(`.agents/skills/design-taste-frontend/SKILL.md`, ~88 KB). Las 3 skills que
el usuario pidió usar quedaron identificadas como:
- `Impeccable` → `.claude/skills/impeccable/SKILL.md` +
  `reference/audit.md` (checklist técnico: a11y, performance, theming,
  responsive, integridad de implementación).
- `Emil Kowaski` → `.agents/skills/emil-design-eng/SKILL.md` (filosofía de
  Emil Kowalski sobre microinteracciones, easing, feedback táctil).
- `Taste Skill` → `.agents/skills/design-taste-frontend/SKILL.md`.

**Auditoría hecha y APLICADA** (auditoría delegada a un subagente para no
inflar el contexto de la sesión principal — los 4 archivos de skills leídos
sumaban >130 KB de texto; la implementación de los 16 hallazgos la hizo la
sesión principal directamente, no un subagente). Reporte completo en
`AUDIT.md`, en la raíz del proyecto — queda como referencia histórica, pero
**los 16 hallazgos ya están corregidos** en `index.html`, `css/styles.css`
y `js/app.js`, verificado con Playwright (consola sin errores, foco de
teclado, tamaños de botón, aria-current, scroll-margin-top, etc.). Resumen
de lo implementado:
- El carrito ya NO se abre solo al hacer "Agregar" — ahora el contador del
  FAB (`#cart-fab-count`) da un pulso visual (`bumpCartFabCount()`).
- `#cart-panel` maneja foco completo: trampa de Tab, Escape cierra, el foco
  vuelve a quien abrió el diálogo (`handleCartKeydown`/`getFocusableElements`
  en `js/app.js`).
- `.menu-section` tiene `scroll-margin-top` para no quedar tapada por el
  header sticky de categorías.
- Transiciones/feedback táctil (`:active { transform: scale(...) }`) en
  todos los botones interactivos; el panel del carrito ahora desliza/hace
  fade en vez de aparecer de golpe (respeta `prefers-reduced-motion`).
- Objetivos táctiles subidos a 44×44px (`.qty-btn`, `.icon-button`,
  `.cart-item-remove`).
- Ícono del carrito y de cerrar pasaron de emoji/Unicode a SVG inline.
- `aria-current` de las categorías se actualiza al hacer clic (antes
  quedaba fijo en la primera para siempre).
- Scroll del body bloqueado mientras el carrito está abierto.
- Colores hard-codeados movidos a tokens nuevos (`--color-on-primary`,
  `--color-overlay`, `--color-fab-count-bg`, etc.).
- Meta tags Open Graph + `theme-color` agregados; se generó
  `assets/img/og-image.png` (1200×630, placeholder) para la preview al
  compartir el link por WhatsApp — **hay que reemplazarla cuando llegue el
  logo/branding real**.
- `qty-value` con `aria-live="polite"` y `role="group"` en el stepper.
- `aria-label` dinámico por item en la lista del carrito (antes era
  genérico y repetido).
- Skeleton loader (`#menu-skeleton`) reemplazó el texto plano de carga.
- Gradiente (`mask-image`) en los bordes de la barra de categorías como
  pista de que se puede scrollear.
- Versionado de caché simplificado de 6 a 2 puntos de sincronización
  (`APP_VERSION` en `js/app.js` + `?v=` en `index.html`), actualmente `v=4`.
No se tocaron `menu.js`, `cart.js` ni `whatsapp.js` (no lo necesitaban).

Otras skills del mismo paquete no usadas en esta auditoría pero
potencialmente relevantes más adelante: `animate`, `animate-expo`,
`animation-vocabulary`, `apple-design`, `ask-sonner`, `brandkit`,
`find-animation-opportunities`, `high-end-visual-design`, `image-to-code`,
`imagegen-frontend-mobile`, `imagegen-frontend-web`, `improve-animations`,
`industrial-brutalist-ui`, `minimalist-ui`, `pick-ui-library`, `prototype`,
`redesign-existing-projects`, `review-animations`, `write-swift`.

## Decisiones tomadas (para no repreguntar)

- Carrito acumulado (no botón individual por item) — elegido por el usuario.
- Sí va a haber fotos por item (campo `imagen` en `menu.json`).
- Se empezó con datos de ejemplo en vez de esperar los datos reales.
- El `.git` del entorno de nube se usó solo como prueba de humo, nunca se
  entregó ni se pretendió que sea el repo real del usuario.
- Skill de "taste" para la auditoría: `design-taste-frontend` (de las 4
  candidatas). Ver sección de skills de terceros arriba.

## Próximo paso sugerido

Si el usuario retoma sin contexto: preguntar (a) si ya reemplazó los datos
reales en `config.js`/`menu.json`, (b) si ya corrió los comandos de git y
publicó en GitHub Pages (se le dieron los comandos, no se confirmó que los
haya ejecutado), y (c) si quiere avanzar con el rediseño visual (colores/
tipografía en `:root` de `styles.css`) ahora que la base funcional y de
accesibilidad ya está sólida. Los 16 hallazgos de `AUDIT.md` ya están
implementados — no hay que volver a ofrecerlos. No repetir preguntas ya
respondidas en la sección de decisiones tomadas arriba.

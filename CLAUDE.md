# CLAUDE.md — Guía del proyecto para Claude

Este archivo es contexto persistente para cualquier sesión de Claude (Cowork,
Claude Code, etc.) que trabaje en esta carpeta. Léelo antes de tocar código.
Para el estado actual del trabajo (qué falta, qué se decidió) ver `HANDOFF.md`.

## Qué es este proyecto

Sitio web estático, sin backend ni build, para una tiendita de desayunos. El
cliente ve el menú (cargado desde un JSON estático), arma un pedido con un
carrito en memoria, y un botón abre WhatsApp (`wa.me`) con el pedido ya
escrito como mensaje. Pensado para publicarse en GitHub Pages.

## Stack y restricciones intencionales

- HTML + CSS + JavaScript "vanilla" (ES modules nativos, sin bundler, sin
  framework, sin `npm install`). Es una decisión de diseño, no una limitación
  temporal: mantenerlo así para que cualquiera pueda editarlo sin toolchain.
- Sin backend. `data/menu.json` es la única "base de datos".
- El envío del pedido usa el esquema público `https://wa.me/<numero>?text=...`,
  no la API oficial de WhatsApp Business.

## Mapa de archivos

```
index.html          Página única. No usar herramientas de build para tocarla.
css/styles.css       Único archivo de estilos. Variables CSS en :root
                      (colores, tipografía, espaciados) — pensado para que
                      un rediseño solo toque esas variables cuando sea posible.
js/config.js          Config editable por el dueño de la tienda (ver abajo).
js/menu.js             Fetch de data/menu.json.
js/cart.js              Estado del carrito (clase Cart, pub/sub simple).
js/whatsapp.js           Arma el texto del pedido y el link wa.me.
js/app.js                 Entry point, conecta todo con el DOM. Único
                           archivo con <script type="module"> en index.html.
data/menu.json        "Base de datos" estática: categorías → items.
assets/               Logo, ícono de WhatsApp, favicon, fotos de items.
README.md             Instrucciones para el dueño de la tienda (no técnico):
                        cómo editar datos, probar local, publicar en Pages.
HANDOFF.md            Estado del proyecto para retomar sin recapitular el chat.
```

## Convenciones importantes

**Contenido vs. lógica**: el contenido del negocio (menú, precios, número de
WhatsApp, textos) vive SOLO en `js/config.js` y `data/menu.json`. No hace
falta ni se debe tocar `app.js`/`cart.js`/`menu.js`/`whatsapp.js` para
cambiar datos del negocio.

**Versionado de caché**: `index.html` y `js/app.js` referencian los demás
archivos con un query string `?v=N` (actualmente `v=4`). GitHub Pages no
permite configurar cache-control headers, así que esto es lo que fuerza a
los navegadores a bajar la versión nueva de CSS/JS en vez de servir una
copia vieja en caché. Desde la auditoría (`AUDIT.md` hallazgo #15),
`js/app.js` usa `import()` dinámico con una sola constante `APP_VERSION` en
vez de 4 imports estáticos cada uno con su propio `?v=`, así que **ahora
solo hay 2 lugares que sincronizar cada vez que se publique un cambio en
`styles.css` o en cualquier `.js`**: la constante `APP_VERSION` al inicio de
`js/app.js`, y el `?v=` de `index.html` (en el `<link>` y en el `<script
type="module">`, que deben llevar el mismo número entre sí). `data/menu.json`
no necesita esto: `menu.js` ya hace `fetch(..., {cache: "no-store"})`.

**Diseño intencionalmente base**: `css/styles.css` da estructura y
comportamiento (layout responsivo, estados), no identidad visual definitiva.
Los colores/tipografía en `:root` son placeholder a propósito, para que un
paso posterior de diseño (Claude Design u otra herramienta) los reemplace
sin tener que tocar la lógica de layout.

**Responsivo**: ya se probó y ajustó para pantallas de teléfono (ver
`HANDOFF.md` para el detalle de qué se cambió). Cualquier cambio de CSS debe
revisarse en al menos un ancho de escritorio y uno de teléfono (~375px)
antes de darlo por bueno.

**Accesibilidad e interacción (post-auditoría)**: el panel del carrito
(`#cart-panel`) implementa manejo de foco completo (trampa de foco, Escape
cierra, el foco vuelve a quien abrió el diálogo) en `js/app.js` — si se
edita ese archivo, no romper `handleCartKeydown`/`getFocusableElements`.
Los íconos del carrito y de cerrar son SVG inline (no emoji/glifos Unicode)
para heredar `currentColor` y verse igual en todos los sistemas. Todos los
controles interactivos deben mantener un objetivo táctil de al menos 44×44px
(`.qty-btn`, `.icon-button`, `.cart-item-remove`). Los colores de texto
sobre fondos de color (blanco sobre botones, overlay del carrito) usan
tokens (`--color-on-primary`, `--color-overlay`, etc.) en vez de valores
literales — al rediseñar la paleta, actualizar esos tokens, no buscar `#fff`
en el archivo.

## Cómo probar cambios

No sirve abrir `index.html` con doble clic (el `fetch` de `menu.json` se
bloquea en `file://`). Levantar un servidor local:

```bash
cd tiendita-desayunos
python3 -m http.server 8000
# o: npx serve .
```

Si hay Playwright disponible en el entorno de trabajo, es la forma más
rápida de verificar visualmente varios anchos de pantalla sin depender de
que el usuario abra el navegador.

## Sobre control de versiones (git)

Este proyecto vive en la carpeta local del usuario en su computadora
(actualmente `C:\dev\tiendita-desayunos-CL` en Windows). **No asumir que
existe un repositorio git inicializado ahí** — verificarlo listando la
carpeta (¿existe `.git/`?) antes de dar por hecho cualquier estado de git.
Una sesión de Claude que trabaja por el puente a la computadora del usuario
(sin acceso a terminal local) NO puede ejecutar `git init/add/commit` por su
cuenta ahí — solo puede leer/escribir archivos. Si se necesita correr git,
hay que pedirle al usuario que lo corra él mismo (dar los comandos exactos)
o hacerlo en un entorno con shell disponible.

## Skills de terceros instaladas en esta carpeta

El usuario instaló varios paquetes de skills de terceros directamente en el
proyecto, visibles en `.claude/skills/`, `.agents/skills/` y `.agent/skills/`
(mismo contenido replicado para compatibilidad con distintas herramientas de
agente: Claude Code, Gemini CLI, etc.). Estas NO están registradas como
skills nativas de una sesión de Cowork — hay que leer sus `SKILL.md`
directamente del disco y aplicar el criterio manualmente, no invocarlas con
la herramienta `Skill`. Ver `HANDOFF.md` para el inventario completo y qué
se decidió usar.

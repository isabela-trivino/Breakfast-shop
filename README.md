# Tiendita de Desayunos — Menú web con pedidos por WhatsApp

Sitio web estático (sin backend, sin build) donde los clientes ven el menú de
desayunos, arman su pedido y lo envían directo al WhatsApp de la tienda con
un solo botón.

## 1. Estructura del proyecto

```
tiendita-desayunos/
├── index.html              # Página única del sitio
├── css/
│   └── styles.css          # Estilos base (layout). Aquí se aplicará el diseño final.
├── js/
│   ├── config.js           # ⚙️ Datos editables: nombre, WhatsApp, mensajes
│   ├── menu.js              # Carga data/menu.json
│   ├── cart.js              # Estado del carrito (en memoria)
│   ├── whatsapp.js          # Arma el mensaje y el link de wa.me
│   └── app.js                # Conecta todo con el DOM (punto de entrada)
├── data/
│   └── menu.json            # 📋 "Base de datos" estática del menú (categorías, items, precios)
├── assets/
│   ├── img/
│   │   ├── logo.svg          # Logo de la tienda (placeholder)
│   │   └── items/             # Fotos de cada desayuno
│   └── icons/                 # Íconos (whatsapp, favicon)
├── .gitignore
└── README.md
```

Es una estructura típica de sitio estático para GitHub Pages: no requiere
Node, build ni framework. `index.html` es el punto de entrada.

## 2. Antes de publicar: datos a reemplazar

Todo lo que hay ahora mismo es **de ejemplo**. Antes de publicar el sitio,
edita:

1. **`js/config.js`**
   - `whatsappNumero`: número real de la tienda, formato internacional sin
     "+", sin espacios ni guiones. Ejemplo Venezuela: `584121234567`.
   - `nombreTienda`, `eslogan`, `mensajeSaludo`, `mensajeCierre`: textos reales.

2. **`data/menu.json`**
   - Reemplaza las categorías e items de ejemplo por el menú real: `nombre`,
     `descripcion`, `precio` (número, sin símbolo de moneda) y `disponible`
     (`true`/`false` para marcar agotados sin borrar el item).
   - El campo `imagen` apunta a un archivo dentro de `assets/img/items/`.
     Puedes usar `.jpg`, `.png` o `.webp` (no hace falta que sea `.svg`).

3. **`assets/img/logo.svg`** y **`assets/img/items/*`**: reemplaza por el
   logo y las fotos reales del negocio (mismo nombre de archivo o
   actualizando la ruta en `menu.json`).

No es necesario tocar `app.js`, `cart.js`, `menu.js` ni `whatsapp.js` para
cambiar contenido — esos archivos son la lógica y no deberían editarse salvo
que quieras cambiar el comportamiento del sitio.

## 3. Cómo probarlo en tu computadora

El sitio usa `fetch()` para leer `data/menu.json`, así que **no funciona
abriendo `index.html` con doble clic** (los navegadores bloquean `fetch` en
archivos locales `file://`). Necesitas un servidor local muy simple. Usa
cualquiera de estas opciones:

**Con Python (ya viene instalado en Mac/Linux, y en Windows si lo instalaste):**
```bash
cd tiendita-desayunos
python3 -m http.server 8000
# abre http://localhost:8000 en el navegador
```

**Con Node.js (si lo tienes instalado):**
```bash
cd tiendita-desayunos
npx serve .
```

**Con la extensión "Live Server" de VS Code:** clic derecho sobre
`index.html` → "Open with Live Server".

## 4. Publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado, pero
   GitHub Pages gratis requiere que sea público, salvo plan de pago).
2. En tu computadora, dentro de la carpeta `tiendita-desayunos`:
   ```bash
   git init
   git add .
   git commit -m "Primer commit: estructura inicial del sitio"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```
   > Si `git` no está instalado en tu computadora, descárgalo desde
   > https://git-scm.com/downloads e instálalo antes de estos pasos.
3. En GitHub, entra al repositorio → **Settings** → **Pages**.
4. En "Build and deployment" → "Source", elige **Deploy from a branch**.
5. En "Branch", elige `main` y la carpeta `/ (root)` → **Save**.
6. Espera 1-2 minutos. GitHub te dará una URL tipo
   `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

Cada vez que hagas `git push` con cambios (por ejemplo, actualizar precios en
`menu.json`), el sitio publicado se actualiza solo.

## 5. Cómo funciona el pedido por WhatsApp

1. El cliente agrega items del menú al carrito (con cantidad).
2. Al presionar **"Enviar pedido por WhatsApp"**, el sitio arma un mensaje de
   texto con el listado de items, cantidades y el total.
3. Se abre una nueva pestaña hacia `https://wa.me/<numero>?text=<mensaje>`,
   con el mensaje ya escrito dentro de WhatsApp.
4. El cliente solo tiene que presionar "Enviar" dentro de WhatsApp para que
   el pedido llegue a la tienda.

No se necesita ninguna cuenta de WhatsApp Business API ni backend: es el
enlace público `wa.me` que ofrece WhatsApp.

## 6. Próximo paso: diseño visual

Esta versión está pensada para funcionar correctamente pero con un diseño
mínimo (`css/styles.css` solo define estructura, no estilo final). El
siguiente paso del proyecto es generar un archivo de instrucciones para que
Claude Design defina la identidad visual (colores, tipografía, estilo de las
tarjetas del menú, etc.) sobre esta misma estructura.

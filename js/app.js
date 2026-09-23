// Módulos nativos: sin versiones manuales duplicadas (ver README).
import { STORE_CONFIG } from "./config.js";
import { loadMenu } from "./menu.js";
import { Cart } from "./cart.js";
import { buildOrderMessage, buildWhatsAppLink } from "./whatsapp.js";

const PANEL_ANIMATION_MS = 260; // debe coincidir con --transition-panel en styles.css
const BUMP_ANIMATION_MS = 220;

const cart = new Cart();
let simboloMoneda = STORE_CONFIG.simboloMonedaPorDefecto;

// Elemento que tenía el foco antes de abrir el carrito, para devolvérselo
// al cerrar (hallazgo #2 — manejo de foco de teclado).
let lastFocusedBeforeCart = null;
let closeTimer;
const backgroundElements = [...document.body.children].filter(node => node.matches("header, nav, main, footer, #cart-fab, .skip-link"));

// --- Referencias al DOM ---
const el = {
  storeName: document.getElementById("store-name"),
  storeTagline: document.getElementById("store-tagline"),
  footerStoreName: document.getElementById("footer-store-name"),
  footerYear: document.getElementById("footer-year"),
  menuStatus: document.getElementById("menu-status"),
  menuSkeleton: document.getElementById("menu-skeleton"),
  menuSections: document.getElementById("menu-sections"),
  categoryNavList: document.getElementById("category-nav-list"),
  itemTemplate: document.getElementById("menu-item-template"),
  cartFab: document.getElementById("cart-fab"),
  cartFabCount: document.getElementById("cart-fab-count"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartPanel: document.getElementById("cart-panel"),
  cartClose: document.getElementById("cart-close"),
  cartItemsList: document.getElementById("cart-items-list"),
  cartEmptyMessage: document.getElementById("cart-empty-message"),
  cartTotal: document.getElementById("cart-total"),
  cartWhatsappBtn: document.getElementById("cart-whatsapp-btn"),
  cartItemTemplate: document.getElementById("cart-item-template"),
};

init();

async function init() {
  applyStoreTextConfig();
  wireCartPanelEvents();
  cart.subscribe(renderCart);
  renderCart(cart.getState());

  try {
    const menu = await loadMenu();
    simboloMoneda = menu.simboloMoneda || STORE_CONFIG.simboloMonedaPorDefecto;
    renderMenu(menu);
    renderCart(cart.getState());
    wireCategoryScroll();
    el.menuSkeleton.hidden = true;
    el.menuSections.hidden = false;
    el.menuStatus.textContent = "Menú cargado.";
  } catch (err) {
    console.error(err);
    el.menuSkeleton.hidden = true;
    el.menuStatus.classList.remove("sr-only");
    el.menuStatus.textContent =
      "No pudimos cargar el menú. Comprueba tu conexión y vuelve a intentarlo.";
    const retry = document.createElement("button");
    retry.className = "add-button";
    retry.textContent = "Reintentar";
    retry.addEventListener("click", () => location.reload());
    el.menuStatus.after(retry);
  }
}

function applyStoreTextConfig() {
  document.title = `${STORE_CONFIG.nombreTienda} — Menú y Pedidos por WhatsApp`;
  el.storeName.textContent = STORE_CONFIG.nombreTienda;
  el.footerStoreName.textContent = STORE_CONFIG.nombreTienda;
  el.footerYear.textContent = new Date().getFullYear();
  if (STORE_CONFIG.eslogan) {
    el.storeTagline.textContent = STORE_CONFIG.eslogan;
  } else {
    el.storeTagline.hidden = true;
  }
}

// --- Render del menú ---

function renderMenu(menu) {
  el.menuSections.innerHTML = "";
  el.categoryNavList.innerHTML = "";

  menu.categorias.forEach((categoria, index) => {
    // Botón de navegación por categoría
    const navBtn = document.createElement("a");
    navBtn.href = `#cat-${categoria.id}`;
    navBtn.className = "category-nav-button";
    navBtn.textContent = categoria.nombre;
    navBtn.setAttribute("aria-current", index === 0 ? "true" : "false");
    // Hallazgo #7: antes aria-current quedaba fijo en la primera categoría
    // para siempre. Ahora se actualiza al hacer clic en cualquier pestaña.
    navBtn.addEventListener("click", () => setActiveCategory(navBtn));
    el.categoryNavList.appendChild(navBtn);

    // Sección de la categoría
    const section = document.createElement("section");
    section.className = "menu-section";
    section.id = `cat-${categoria.id}`;

    const title = document.createElement("h2");
    title.className = "menu-section-title";
    title.textContent = categoria.nombre;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "menu-grid";

    categoria.items.forEach((item) => {
      grid.appendChild(renderMenuItem(item));
    });

    section.appendChild(grid);
    el.menuSections.appendChild(section);
  });
}

function setActiveCategory(activeBtn) {
  el.categoryNavList.querySelectorAll(".category-nav-button").forEach((btn) => {
    btn.setAttribute("aria-current", btn === activeBtn ? "true" : "false");
  });
}

function renderMenuItem(item) {
  const node = el.itemTemplate.content.cloneNode(true);
  const article = node.querySelector(".menu-item");
  article.dataset.itemId = item.id;

  const img = node.querySelector(".menu-item-image");
  img.src = item.imagen || "assets/img/items/placeholder.svg";
  img.alt = img.src.endsWith("placeholder.svg") ? "Foto pendiente" : item.imagenIlustrativa ? `Imagen ilustrativa de ${item.nombre}` : item.nombre;
  img.addEventListener("error", () => { img.src = "assets/img/items/placeholder.svg"; }, { once: true });

  node.querySelector(".menu-item-name").textContent = item.nombre;
  node.querySelector(".menu-item-description").textContent = item.descripcion || "";
  const hasPrice = typeof item.precio === "number" && Number.isFinite(item.precio) && item.precio >= 0;
  node.querySelector(".menu-item-price").textContent = hasPrice ? `${simboloMoneda}${item.precio.toFixed(2)}` : "Precio por confirmar";

  const qtyValue = node.querySelector(".qty-value");
  const decreaseBtn = node.querySelector(".qty-decrease");
  const increaseBtn = node.querySelector(".qty-increase");
  const addBtn = node.querySelector(".add-button");

  decreaseBtn.setAttribute("aria-label", `Reducir cantidad de ${item.nombre}`);
  increaseBtn.setAttribute("aria-label", `Aumentar cantidad de ${item.nombre}`);
  addBtn.setAttribute("aria-label", `Agregar ${item.nombre} al pedido`);
  let cantidad = 1;

  decreaseBtn.addEventListener("click", () => {
    cantidad = Math.max(1, cantidad - 1);
    qtyValue.textContent = cantidad;
  });
  increaseBtn.addEventListener("click", () => {
    cantidad += 1;
    qtyValue.textContent = cantidad;
  });
  addBtn.addEventListener("click", () => {
    cart.addItem(item, cantidad);
    document.getElementById("order-status").textContent = `${cantidad} × ${item.nombre} agregado al pedido.`;
    cantidad = 1;
    qtyValue.textContent = cantidad;
    // Hallazgo #1: antes esto abría el panel del carrito completo en cada
    // clic, interrumpiendo la navegación por el menú. Ahora solo el
    // contador del FAB da un "pulso" como confirmación.
    bumpCartFabCount();
  });

  if (item.disponible === false || !hasPrice) {
    article.classList.add("is-unavailable");
    [decreaseBtn, increaseBtn, addBtn].forEach(button => button.disabled = true);
    node.querySelector(".menu-item-unavailable").hidden = false;
    if (!hasPrice) node.querySelector(".menu-item-unavailable").textContent = "Aún no se puede agregar al pedido";
  }

  return node;
}

function bumpCartFabCount() {
  el.cartFabCount.classList.remove("is-bumping");
  // Forzar reflow para poder re-disparar la animación en clics seguidos.
  void el.cartFabCount.offsetWidth;
  el.cartFabCount.classList.add("is-bumping");
  setTimeout(() => el.cartFabCount.classList.remove("is-bumping"), BUMP_ANIMATION_MS);
}

// --- Carrito: eventos de apertura/cierre ---

function wireCartPanelEvents() {
  el.cartFab.addEventListener("click", openCartPanel);
  el.cartClose.addEventListener("click", closeCartPanel);
  el.cartOverlay.addEventListener("click", closeCartPanel);
  el.cartWhatsappBtn.addEventListener("click", handleSendToWhatsApp);
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((elx) => elx.offsetParent !== null);
}

function handleCartKeydown(evt) {
  if (evt.key === "Escape") {
    evt.preventDefault();
    closeCartPanel();
    return;
  }
  // Hallazgo #2: trampa de foco simple — Tab no debe escaparse del diálogo
  // mientras está abierto.
  if (evt.key === "Tab") {
    const focusable = getFocusableElements(el.cartPanel);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (evt.shiftKey && document.activeElement === first) {
      evt.preventDefault();
      last.focus();
    } else if (!evt.shiftKey && document.activeElement === last) {
      evt.preventDefault();
      first.focus();
    }
  }
}

function openCartPanel() {
  clearTimeout(closeTimer);
  if (el.cartPanel.classList.contains("is-open")) return;
  el.cartPanel.inert = false;
  lastFocusedBeforeCart = document.activeElement;

  el.cartPanel.hidden = false;
  el.cartOverlay.hidden = false;
  // Forzar reflow antes de agregar la clase para que la transición CSS
  // (translateX / opacity) sí se anime en vez de saltar directo al estado final.
  void el.cartPanel.offsetWidth;
  el.cartPanel.classList.add("is-open");
  el.cartOverlay.classList.add("is-open");

  el.cartFab.setAttribute("aria-expanded", "true");
  backgroundElements.forEach(node => node.inert = true);
  document.body.style.overflow = "hidden"; // hallazgo #8: bloquear scroll de fondo

  document.addEventListener("keydown", handleCartKeydown);

  // Mover el foco dentro del diálogo (hallazgo #2).
  const focusable = getFocusableElements(el.cartPanel);
  (focusable[0] || el.cartPanel).focus();
}

function closeCartPanel() {
  clearTimeout(closeTimer);
  backgroundElements.forEach(node => node.inert = false);
  el.cartPanel.inert = true;
  el.cartPanel.classList.remove("is-open");
  el.cartOverlay.classList.remove("is-open");
  el.cartFab.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", handleCartKeydown);

  // Esperar a que termine la transición de salida antes de ocultar de
  // verdad (con [hidden]) para que la animación se alcance a ver.
  closeTimer = setTimeout(() => {
    el.cartPanel.hidden = true;
    el.cartOverlay.hidden = true;
  }, PANEL_ANIMATION_MS);

  // Devolver el foco a quien abrió el diálogo (hallazgo #2).
  if (lastFocusedBeforeCart && document.contains(lastFocusedBeforeCart)) {
    lastFocusedBeforeCart.focus();
  } else {
    el.cartFab.focus();
  }
}

// --- Carrito: render ---

function renderCart(state) {
  const focused = document.activeElement;
  const focusedId = focused.closest(".cart-item")?.dataset.itemId;
  const focusedClass = ["qty-increase", "qty-decrease", "cart-item-remove"].find(name => focused.classList.contains(name));
  el.cartFabCount.textContent = state.totalItems;
  el.cartTotal.textContent = `${simboloMoneda}${state.totalPrice.toFixed(2)}`;
  el.cartWhatsappBtn.disabled = state.items.length === 0 || !STORE_CONFIG.whatsappConfirmado;
  document.getElementById("whatsapp-status").hidden = STORE_CONFIG.whatsappConfirmado;
  el.cartFab.setAttribute("aria-label", `Ver pedido, ${state.totalItems} productos, ${simboloMoneda}${state.totalPrice.toFixed(2)}`);

  el.cartItemsList.innerHTML = "";

  if (state.items.length === 0) {
    el.cartEmptyMessage.hidden = false;
    if (focusedId) el.cartClose.focus();
    return;
  }
  el.cartEmptyMessage.hidden = true;

  state.items.forEach((item) => {
    const node = el.cartItemTemplate.content.cloneNode(true);
    const li = node.querySelector(".cart-item");
    li.dataset.itemId = item.id;

    node.querySelector(".cart-item-name").textContent = item.nombre;
    node.querySelector(".cart-item-unit-price").textContent =
      `${simboloMoneda}${item.precio.toFixed(2)} c/u`;
    node.querySelector(".qty-value").textContent = item.cantidad;
    node.querySelector(".cart-item-subtotal").textContent =
      `${simboloMoneda}${(item.precio * item.cantidad).toFixed(2)}`;

    // Hallazgo #12: antes los aria-label eran genéricos ("Quitar item"
    // repetido para cada fila). Ahora incluyen el nombre del producto.
    const decreaseBtn = node.querySelector(".qty-decrease");
    const increaseBtn = node.querySelector(".qty-increase");
    const removeBtn = node.querySelector(".cart-item-remove");
    decreaseBtn.setAttribute("aria-label", `Quitar uno de ${item.nombre}`);
    increaseBtn.setAttribute("aria-label", `Agregar uno más de ${item.nombre}`);
    removeBtn.setAttribute("aria-label", `Quitar ${item.nombre} del carrito`);

    decreaseBtn.addEventListener("click", () => {
      cart.incrementItem(item.id, -1);
    });
    increaseBtn.addEventListener("click", () => {
      cart.incrementItem(item.id, 1);
    });
    removeBtn.addEventListener("click", () => {
      cart.removeItem(item.id);
    });

    el.cartItemsList.appendChild(node);
  });
  if (focusedId) {
    const row = [...el.cartItemsList.children].find(node => node.dataset.itemId === focusedId);
    (row?.querySelector(`.${focusedClass}`) || el.cartClose).focus();
  }
}

// --- Envío a WhatsApp ---

function handleSendToWhatsApp() {
  const state = cart.getState();
  if (state.items.length === 0 || !STORE_CONFIG.whatsappConfirmado) return;

  const mensaje = buildOrderMessage(state.items, state.totalPrice, STORE_CONFIG, simboloMoneda);
  const link = buildWhatsAppLink(STORE_CONFIG.whatsappNumero, mensaje);

  window.open(link, "_blank", "noopener");
}

// Sigue la sección que cruza el borde inferior de la navegación fija.
function wireCategoryScroll() {
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const sections = [...el.menuSections.children];
    const top = document.getElementById("category-nav").getBoundingClientRect().bottom + 12;
    let active = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= top) active = section;
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) active = sections.at(-1);
    if (active) setActiveCategory([...el.categoryNavList.children].find(link => link.hash === `#${active.id}`));
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  requestAnimationFrame(update);
}

// ==========================================================================
// cart.js — Estado del carrito de pedido (en memoria, sin backend)
// ==========================================================================

export class Cart {
  constructor() {
    /** @type {Map<string, {id:string, nombre:string, precio:number, cantidad:number}>} */
    this._items = new Map();
    /** @type {Set<Function>} */
    this._listeners = new Set();
  }

  /** Suscribirse a cambios del carrito. Devuelve función para desuscribirse. */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify() {
    for (const listener of this._listeners) listener(this.getState());
  }

  addItem(item, cantidad = 1) {
    const existing = this._items.get(item.id);
    if (existing) {
      existing.cantidad += cantidad;
    } else {
      this._items.set(item.id, {
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad,
      });
    }
    this._notify();
  }

  setQuantity(itemId, cantidad) {
    const existing = this._items.get(itemId);
    if (!existing) return;
    if (cantidad <= 0) {
      this._items.delete(itemId);
    } else {
      existing.cantidad = cantidad;
    }
    this._notify();
  }

  incrementItem(itemId, delta = 1) {
    const existing = this._items.get(itemId);
    if (!existing) return;
    this.setQuantity(itemId, existing.cantidad + delta);
  }

  removeItem(itemId) {
    this._items.delete(itemId);
    this._notify();
  }

  clear() {
    this._items.clear();
    this._notify();
  }

  getItems() {
    return Array.from(this._items.values());
  }

  getTotalItems() {
    return this.getItems().reduce((sum, i) => sum + i.cantidad, 0);
  }

  getTotalPrice() {
    return this.getItems().reduce((sum, i) => sum + i.cantidad * i.precio, 0);
  }

  getState() {
    return {
      items: this.getItems(),
      totalItems: this.getTotalItems(),
      totalPrice: this.getTotalPrice(),
    };
  }
}

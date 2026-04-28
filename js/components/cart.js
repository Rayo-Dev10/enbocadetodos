import { formatCOP } from "../utils/currency.js";

function renderItemMeta(item) {
  const details = [];

  if (item.protein) {
    details.push(`Proteina: ${item.protein}`);
  }
  if (item.finish) {
    details.push(`Terminacion: ${item.finish}`);
  }
  if (item.sauces.length) {
    details.push(`Salsas: ${item.sauces.join(", ")}`);
  }
  if (item.additions.length) {
    details.push(`Extras: ${item.additions.map((addition) => addition.name).join(", ")}`);
  }

  return details.map((detail) => `<p>${detail}</p>`).join("");
}

export function renderCart({ cart, total }) {
  if (!cart.length) {
    return `
      <div class="sheet__header">
        <div>
          <p class="eyebrow">Carrito</p>
          <h2 id="cartSheetTitle">Tu pedido esta vacio</h2>
        </div>
        <button class="icon-button" type="button" data-action="close-cart" aria-label="Cerrar carrito">
          Cerrar
        </button>
      </div>

      <div class="empty-state">
        <p>Aun no has agregado arepas. Empieza por una base y la personalizamos desde ahi.</p>
        <button class="btn btn--primary" type="button" data-action="close-cart">
          Volver al menu
        </button>
      </div>
    `;
  }

  return `
    <div class="sheet__header">
      <div>
        <p class="eyebrow">Carrito</p>
        <h2 id="cartSheetTitle">${cart.length} configuraciones en el pedido</h2>
      </div>
      <button class="icon-button" type="button" data-action="close-cart" aria-label="Cerrar carrito">
        Cerrar
      </button>
    </div>

    <ul class="cart-list">
      ${cart.map((item) => `
        <li class="cart-item">
          <div class="cart-item__top">
            <div>
              <h3>${item.productName}</h3>
              ${renderItemMeta(item)}
            </div>
            <button class="link-button" type="button" data-action="remove-item" data-item-id="${item.id}">
              Quitar
            </button>
          </div>

          <div class="cart-item__bottom">
            <div class="stepper" aria-label="Cambiar cantidad">
              <button type="button" data-action="decrease-quantity" data-item-id="${item.id}" aria-label="Restar una unidad">
                -
              </button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase-quantity" data-item-id="${item.id}" aria-label="Sumar una unidad">
                +
              </button>
            </div>
            <strong>${formatCOP(item.subtotal * item.quantity)}</strong>
          </div>
        </li>
      `).join("")}
    </ul>

    <div class="cart-summary">
      <div>
        <p class="eyebrow">Total actual</p>
        <strong>${formatCOP(total)}</strong>
      </div>
      <div class="cart-summary__actions">
        <button class="btn btn--ghost" type="button" data-action="clear-cart">
          Vaciar
        </button>
        <button class="btn btn--primary" type="button" data-action="go-checkout">
          Continuar pedido
        </button>
      </div>
    </div>
  `;
}

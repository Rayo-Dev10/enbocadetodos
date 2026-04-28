import { formatCOP } from "../utils/currency.js";

export function renderCheckout({ cart, total, business, isOnline }) {
  if (!cart.length) {
    return `
      <div class="checkout-card">
        <p class="eyebrow">Checkout</p>
        <h2>Tu carrito esta vacio</h2>
        <p>Cuando agregues una arepa, aqui apareceran el resumen final y el boton para abrir WhatsApp.</p>
        <button class="btn btn--primary" type="button" data-action="back-to-menu">
          Volver al menu
        </button>
      </div>
    `;
  }

  return `
    <div class="section-heading section-heading--checkout">
      <div>
        <p class="eyebrow">Checkout</p>
        <h2>Ultimo paso antes de WhatsApp</h2>
      </div>
      <p class="section-heading__note">${business.deliveryHint}</p>
    </div>

    <div class="checkout-grid">
      <section class="checkout-card checkout-card--summary">
        <h3>Resumen del pedido</h3>
        <ul class="checkout-list">
          ${cart.map((item) => `
            <li>
              <div>
                <strong>${item.quantity}x ${item.productName}</strong>
                <p>${item.finish}</p>
                ${item.protein ? `<p>${item.protein}</p>` : ""}
                ${item.additions.length ? `<p>${item.additions.map((addition) => addition.name).join(", ")}</p>` : ""}
              </div>
              <span>${formatCOP(item.subtotal * item.quantity)}</span>
            </li>
          `).join("")}
        </ul>
        <div class="checkout-total">
          <span>Total</span>
          <strong>${formatCOP(total)}</strong>
        </div>
      </section>

      <form class="checkout-card checkout-card--form" id="checkoutForm">
        <h3>Direccion de entrega</h3>
        <label class="field" for="deliveryAddress">
          <span>¿Donde entregamos tu pedido?</span>
          <textarea
            id="deliveryAddress"
            name="deliveryAddress"
            rows="4"
            minlength="10"
            maxlength="180"
            required
            placeholder="Ej: Casa de Mauricio Hoyos, frente al parque"></textarea>
        </label>

        <p class="checkout-note ${isOnline ? "" : "checkout-note--alert"}">
          ${isOnline ? "Tu carrito se conserva incluso despues de abrir WhatsApp." : "Sin conexion puedes revisar el pedido, pero no abrir WhatsApp todavia."}
        </p>

        <div class="checkout-actions">
          <button class="btn btn--ghost" type="button" data-action="back-to-menu">
            Seguir pidiendo
          </button>
          <button class="btn btn--primary" type="submit">
            Abrir WhatsApp
          </button>
        </div>
      </form>
    </div>
  `;
}

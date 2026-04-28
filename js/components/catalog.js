import { formatCOP } from "../utils/currency.js";

export function renderCatalog(products) {
  return products.map((product) => `
    <article class="product-card">
      <div class="product-card__visual">
        <img src="${product.image}" alt="${product.name}" width="480" height="360" loading="lazy">
        <span class="product-card__tag">${product.tagline}</span>
      </div>

      <div class="product-card__body">
        <p class="eyebrow">${product.tagline}</p>
        <h3>${product.name}</h3>
        <p class="product-card__description">${product.description}</p>
        <ul class="product-card__list">
          ${product.included.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>

      <div class="product-card__footer">
        <strong>${formatCOP(product.price)}</strong>
        <button
          class="btn btn--primary"
          type="button"
          data-action="open-product"
          data-product-id="${product.id}">
          Personalizar
        </button>
      </div>
    </article>
  `).join("");
}

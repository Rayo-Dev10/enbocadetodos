import { formatCOP } from "../utils/currency.js";

function renderChoiceChips(name, values, selectedValue, required = false) {
  return values.map((value, index) => `
    <label class="chip">
      <input
        class="chip__input"
        type="radio"
        name="${name}"
        value="${value}"
        ${selectedValue === value ? "checked" : ""}
        ${required && index === 0 && !selectedValue ? "required" : ""}
        ${required && selectedValue ? "required" : ""}>
      <span>${value}</span>
    </label>
  `).join("");
}

function renderToggleChips(name, values, selectedValues) {
  return values.map((value) => `
    <label class="chip">
      <input
        class="chip__input"
        type="checkbox"
        name="${name}"
        value="${value}"
        ${selectedValues.includes(value) ? "checked" : ""}>
      <span>${value}</span>
    </label>
  `).join("");
}

function renderAdditionGroups(additionGroups, selectedAdditions) {
  return additionGroups.map((group) => `
    <section class="builder-group">
      <div class="builder-group__header">
        <h3>${group.label}</h3>
        <span>${group.note}</span>
      </div>
      <div class="chip-grid">
        ${renderToggleChips("addition", group.items, selectedAdditions)}
      </div>
    </section>
  `).join("");
}

export function calculateSubtotal(basePrice, additions) {
  return additions.reduce((sum, addition) => sum + addition.price, basePrice);
}

export function readProductForm(form, additionGroups, product) {
  const formData = new FormData(form);
  const additions = [];

  formData.getAll("addition").forEach((selectedName) => {
    const match = additionGroups
      .flatMap((group) => group.items.map((item) => ({ name: item, price: group.price })))
      .find((item) => item.name === selectedName);

    if (match) {
      additions.push(match);
    }
  });

  return {
    protein: formData.get("protein") || "",
    finish: formData.get("finish") || product.finishOptions[0] || "",
    sauces: formData.getAll("sauce"),
    additions
  };
}

export function renderProductModal({ product, proteinOptions, sauces, additionGroups, draft, subtotal }) {
  return `
    <div class="sheet__header">
      <div>
        <p class="eyebrow">Personaliza tu pedido</p>
        <h2 id="productSheetTitle">${product.name}</h2>
      </div>
      <button class="icon-button" type="button" data-action="close-product" aria-label="Cerrar personalizacion">
        Cerrar
      </button>
    </div>

    <div class="sheet__hero">
      <img src="${product.image}" alt="" width="480" height="360" aria-hidden="true">
      <div>
        <p>${product.description}</p>
        <strong>${formatCOP(product.price)}</strong>
      </div>
    </div>

    <form class="builder-form" id="productForm" novalidate>
      ${product.requiresProtein ? `
        <section class="builder-group">
          <div class="builder-group__header">
            <h3>Proteina</h3>
            <span>Elige una opcion</span>
          </div>
          <div class="chip-grid">
            ${renderChoiceChips("protein", proteinOptions, draft.protein, true)}
          </div>
        </section>
      ` : ""}

      <section class="builder-group">
        <div class="builder-group__header">
          <h3>Terminacion incluida</h3>
          <span>Escoge el cierre fresco</span>
        </div>
        <div class="chip-grid">
          ${renderChoiceChips("finish", product.finishOptions, draft.finish || product.finishOptions[0], true)}
        </div>
      </section>

      <section class="builder-group">
        <div class="builder-group__header">
          <h3>Salsas</h3>
          <span>Sin costo adicional</span>
        </div>
        <div class="chip-grid">
          ${renderToggleChips("sauce", sauces, draft.sauces)}
        </div>
      </section>

      ${renderAdditionGroups(additionGroups, draft.additions.map((addition) => addition.name))}

      <section class="builder-group builder-group--summary">
        <div class="builder-group__header">
          <h3>Incluye de base</h3>
          <span>Para que sepas exactamente que va</span>
        </div>
        <ul class="builder-summary">
          ${product.included.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>

      <div class="builder-footer">
        <p class="builder-footer__note">El carrito se guarda en este dispositivo.</p>
        <button class="btn btn--primary btn--full" type="submit" id="addToCartButton">
          Añadir al carrito · ${formatCOP(subtotal)}
        </button>
      </div>
    </form>
  `;
}

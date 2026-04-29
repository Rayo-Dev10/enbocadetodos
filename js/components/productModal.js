import { formatCOP } from "../utils/currency.js";

function renderChoiceChips(name, values, selectedValue, required = false) {
  return values.map((value) => `
    <label class="chip">
      <input
        class="chip__input"
        type="radio"
        name="${name}"
        value="${value}"
        ${selectedValue === value ? "checked" : ""}
        ${required ? "required" : ""}>
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

function renderQuantityControls(draft, flow) {
  if (flow) {
    return `
      <section class="builder-group">
        <div class="builder-group__header">
          <h3>Personalización individual</h3>
          <span>Arepa ${flow.currentStep} de ${flow.totalQuantity}</span>
        </div>
        <p class="builder-flow-note">
          Esta arepa empieza limpia para que la personalices desde cero.
        </p>
        <input type="hidden" name="quantity" value="${flow.totalQuantity}">
        <input type="hidden" name="splitItems" value="on">
      </section>
    `;
  }

  return `
    <section class="builder-group">
      <div class="builder-group__header">
        <h3>Cantidad</h3>
        <span>Define cuántas vas a pedir</span>
      </div>

      <div class="builder-quantity">
        <div class="stepper stepper--builder" aria-label="Cambiar cantidad">
          <button type="button" data-action="decrease-builder-quantity" aria-label="Restar una unidad">
            -
          </button>
          <input class="quantity-input" id="productQuantity" name="quantity" type="number" min="1" max="12" inputmode="numeric" value="${draft.quantity}">
          <button type="button" data-action="increase-builder-quantity" aria-label="Sumar una unidad">
            +
          </button>
        </div>

        <label class="builder-toggle" id="splitItemsToggle" ${draft.quantity > 1 ? "" : "hidden"}>
          <input type="checkbox" name="splitItems" ${draft.splitItems ? "checked" : ""}>
          <span>Quiero personalizar cada una diferente</span>
        </label>
      </div>
    </section>
  `;
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

  const quantity = Math.max(1, Math.min(12, Number(formData.get("quantity") || 1)));
  const splitField = formData.get("splitItems");

  return {
    protein: formData.get("protein") || "",
    finish: formData.get("finish") || "",
    sauces: formData.getAll("sauce").slice(0, product.maxSauces || Number.POSITIVE_INFINITY),
    additions,
    quantity,
    splitItems: splitField === "on" && quantity > 1
  };
}

export function getProductSubmitLabel({ draft, subtotal, flow }) {
  if (flow) {
    if (flow.currentStep < flow.totalQuantity) {
      return `Guardar y seguir · ${formatCOP(subtotal)}`;
    }

    return `Añadir pedido completo · ${formatCOP(subtotal)}`;
  }

  if (draft.splitItems && draft.quantity > 1) {
    return `Empezar personalización por unidad · ${formatCOP(subtotal)}`;
  }

  const quantityCopy = draft.quantity > 1 ? `x${draft.quantity} ` : "";
  return `Añadir ${quantityCopy}al carrito · ${formatCOP(subtotal)}`;
}

export function renderProductModal({
  product,
  proteinOptions,
  sauces,
  additionGroups,
  draft,
  subtotal,
  submitLabel,
  flow
}) {
  return `
    <div class="sheet__header">
      <div>
        <p class="eyebrow">Personaliza tu pedido</p>
        <h2 id="productSheetTitle">${product.name}</h2>
      </div>
      <button class="icon-button" type="button" data-action="close-product" aria-label="Cerrar personalización">
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
      ${renderQuantityControls(draft, flow)}

      ${product.requiresProtein ? `
        <section class="builder-group">
          <div class="builder-group__header">
            <h3>Proteína</h3>
            <span>Elige una opción</span>
          </div>
          <div class="chip-grid">
            ${renderChoiceChips("protein", proteinOptions, draft.protein, true)}
          </div>
        </section>
      ` : ""}

      <section class="builder-group">
        <div class="builder-group__header">
          <h3>Terminación incluida</h3>
          <span>Escoge el cierre fresco</span>
        </div>
        <div class="chip-grid">
          ${renderChoiceChips("finish", product.finishOptions, draft.finish, true)}
        </div>
      </section>

      <section class="builder-group">
        <div class="builder-group__header">
          <h3>Salsas</h3>
          <span>${product.maxSauces ? `Máximo ${product.maxSauces}` : "Sin costo adicional"}</span>
        </div>
        <div class="chip-grid">
          ${renderToggleChips("sauce", sauces, draft.sauces)}
        </div>
      </section>

      ${renderAdditionGroups(additionGroups, draft.additions.map((addition) => addition.name))}

      <section class="builder-group builder-group--summary">
        <div class="builder-group__header">
          <h3>Incluye de base</h3>
          <span>Para que sepas exactamente qué va</span>
        </div>
        <ul class="builder-summary">
          ${product.included.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>

      <div class="builder-footer">
        <p class="builder-footer__note">El carrito se guarda en este dispositivo.</p>
        <button class="btn btn--primary btn--full" type="submit" id="addToCartButton">
          ${submitLabel}
        </button>
      </div>
    </form>
  `;
}

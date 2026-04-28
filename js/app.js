import { ADDITION_GROUPS, BUSINESS, PRODUCTS, PROTEIN_OPTIONS, SAUCES } from "./data.js";
import { renderCart } from "./components/cart.js";
import { renderCatalog } from "./components/catalog.js";
import { renderCheckout } from "./components/checkout.js";
import { calculateSubtotal, readProductForm, renderProductModal } from "./components/productModal.js";
import { clearCart, loadCart, saveCart } from "./utils/storage.js";
import { buildWhatsAppUrl } from "./utils/whatsapp.js";

const productById = new Map(PRODUCTS.map((product) => [product.id, product]));

const state = {
  cart: Array.isArray(loadCart()) ? loadCart() : [],
  activeProductId: null,
  modalDraft: null,
  deliveryAddress: "",
  currentView: "menu",
  installPrompt: null,
  toastTimer: null,
  activeLayer: null,
  lastFocusedElement: null
};

const dom = typeof document !== "undefined" ? {
  catalogGrid: document.querySelector("#catalogGrid"),
  cartButton: document.querySelector("#cartButton"),
  cartFab: document.querySelector("#cartFab"),
  cartBadgeHeader: document.querySelector("#cartBadgeHeader"),
  cartBadgeFab: document.querySelector("#cartBadgeFab"),
  cartOverlay: document.querySelector("#cartOverlay"),
  cartSheet: document.querySelector("#cartSheet"),
  checkoutSection: document.querySelector("#checkoutSection"),
  heroCartButton: document.querySelector("#heroCartButton"),
  installButton: document.querySelector("#installButton"),
  menuSection: document.querySelector("#menuSection"),
  offlineBanner: document.querySelector("#offlineBanner"),
  productOverlay: document.querySelector("#productOverlay"),
  productSheet: document.querySelector("#productSheet"),
  scrollMenuButton: document.querySelector("#scrollMenuButton"),
  sectionHeading: document.querySelector(".section-heading"),
  toast: document.querySelector("#toast")
} : null;

function createUniqueId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function computeCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.subtotal * item.quantity, 0);
}

function countCartUnits(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function createCartFingerprint(item) {
  const saucesKey = [...item.sauces].sort().join("|");
  const additionsKey = item.additions.map((addition) => addition.name).sort().join("|");
  return [
    item.productId,
    item.protein,
    item.finish,
    saucesKey,
    additionsKey
  ].join("::");
}

function createCartItem(product, draft) {
  const normalizedAdditions = [...draft.additions].sort((left, right) => left.name.localeCompare(right.name));
  const normalizedSauces = [...draft.sauces].sort((left, right) => left.localeCompare(right));

  return {
    id: createUniqueId(),
    productId: product.id,
    productName: product.name,
    basePrice: product.price,
    protein: draft.protein || "",
    finish: draft.finish || "",
    sauces: normalizedSauces,
    additions: normalizedAdditions,
    subtotal: calculateSubtotal(product.price, normalizedAdditions),
    quantity: 1
  };
}

function getCurrentViewFromHash() {
  return window.location.hash === "#/checkout" ? "checkout" : "menu";
}

function showToast(message) {
  if (!dom) {
    return;
  }

  window.clearTimeout(state.toastTimer);
  dom.toast.textContent = message;
  dom.toast.hidden = false;
  dom.toast.classList.add("is-visible");

  state.toastTimer = window.setTimeout(() => {
    dom.toast.classList.remove("is-visible");
    window.setTimeout(() => {
      dom.toast.hidden = true;
    }, 180);
  }, 2600);
}

function getFocusableElements(container) {
  return [...container.querySelectorAll(
    "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
  )].filter((element) => !element.hasAttribute("disabled"));
}

function trapFocus(event, container) {
  const focusableElements = getFocusableElements(container);
  if (!focusableElements.length) {
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function openLayer(layerName, overlay, contentElement, triggerElement) {
  if (state.activeLayer && state.activeLayer !== layerName) {
    closeActiveLayer(false);
  }

  state.activeLayer = layerName;
  state.lastFocusedElement = triggerElement || document.activeElement;
  overlay.hidden = false;
  document.body.classList.add("body--locked");

  window.requestAnimationFrame(() => {
    overlay.classList.add("is-open");
    const focusTarget = getFocusableElements(contentElement)[0];
    if (focusTarget) {
      focusTarget.focus();
    }
  });
}

function hideOverlay(overlay) {
  overlay.classList.remove("is-open");
  window.setTimeout(() => {
    overlay.hidden = true;
    if (!dom.productOverlay.classList.contains("is-open") && !dom.cartOverlay.classList.contains("is-open")) {
      document.body.classList.remove("body--locked");
    }
  }, 180);
}

function closeProductModal(restoreFocus = true) {
  state.activeProductId = null;
  state.modalDraft = null;
  hideOverlay(dom.productOverlay);
  state.activeLayer = null;
  dom.productSheet.innerHTML = "";

  if (restoreFocus && state.lastFocusedElement instanceof HTMLElement) {
    state.lastFocusedElement.focus();
  }
}

function closeCartPanel(restoreFocus = true) {
  hideOverlay(dom.cartOverlay);
  state.activeLayer = null;

  if (restoreFocus && state.lastFocusedElement instanceof HTMLElement) {
    state.lastFocusedElement.focus();
  }
}

function closeActiveLayer(restoreFocus = true) {
  if (state.activeLayer === "product") {
    closeProductModal(restoreFocus);
  } else if (state.activeLayer === "cart") {
    closeCartPanel(restoreFocus);
  }
}

function updateCartBadges() {
  const totalUnits = countCartUnits(state.cart);
  dom.cartBadgeHeader.textContent = `${totalUnits}`;
  dom.cartBadgeFab.textContent = `${totalUnits}`;
  dom.cartFab.hidden = totalUnits === 0;
}

function renderCartPanel() {
  dom.cartSheet.innerHTML = renderCart({
    cart: state.cart,
    total: computeCartTotal(state.cart)
  });
}

function renderCheckoutSection() {
  dom.checkoutSection.innerHTML = renderCheckout({
    cart: state.cart,
    total: computeCartTotal(state.cart),
    business: BUSINESS,
    isOnline: navigator.onLine
  });

  const addressField = dom.checkoutSection.querySelector("#deliveryAddress");
  if (addressField) {
    addressField.value = state.deliveryAddress;
  }
}

function syncCart() {
  saveCart(state.cart);

  if (!state.cart.length && state.currentView === "checkout") {
    window.location.hash = "#/";
  }

  updateCartBadges();
  renderCartPanel();
  renderCheckoutSection();
}

function updateSubtotalLabel(form) {
  const product = productById.get(state.activeProductId);
  if (!product) {
    return;
  }

  state.modalDraft = readProductForm(form, ADDITION_GROUPS, product);
  const subtotal = calculateSubtotal(product.price, state.modalDraft.additions);
  const button = form.querySelector("#addToCartButton");

  if (button) {
    button.textContent = `Añadir al carrito · ${new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(subtotal)}`;
  }
}

function openProductModal(productId, triggerElement) {
  const product = productById.get(productId);
  if (!product) {
    return;
  }

  state.activeProductId = productId;
  state.modalDraft = {
    protein: "",
    finish: product.finishOptions[0] || "",
    sauces: [],
    additions: []
  };

  dom.productSheet.innerHTML = renderProductModal({
    product,
    proteinOptions: PROTEIN_OPTIONS,
    sauces: SAUCES,
    additionGroups: ADDITION_GROUPS,
    draft: state.modalDraft,
    subtotal: calculateSubtotal(product.price, [])
  });

  const form = dom.productSheet.querySelector("#productForm");
  form.addEventListener("input", () => updateSubtotalLabel(form));
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const draft = readProductForm(form, ADDITION_GROUPS, product);
    const cartItem = createCartItem(product, draft);
    const fingerprint = createCartFingerprint(cartItem);
    const existingIndex = state.cart.findIndex((item) => createCartFingerprint(item) === fingerprint);

    if (existingIndex >= 0) {
      state.cart[existingIndex].quantity += 1;
    } else {
      state.cart.push(cartItem);
    }

    syncCart();
    closeProductModal(false);
    showToast("Pedido agregado al carrito.");
  });

  openLayer("product", dom.productOverlay, dom.productSheet, triggerElement);
}

function openCartPanel(triggerElement) {
  renderCartPanel();
  openLayer("cart", dom.cartOverlay, dom.cartSheet, triggerElement);
}

function updateView() {
  state.currentView = getCurrentViewFromHash();

  if (state.currentView === "checkout" && !state.cart.length) {
    state.currentView = "menu";
    window.location.hash = "#/";
  }

  const showCheckout = state.currentView === "checkout";
  dom.menuSection.hidden = showCheckout;
  dom.sectionHeading.hidden = showCheckout;
  dom.catalogGrid.hidden = showCheckout;
  dom.checkoutSection.hidden = !showCheckout;

  if (showCheckout) {
    renderCheckoutSection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function handleCatalogClick(event) {
  const button = event.target.closest("[data-action='open-product']");
  if (!button) {
    return;
  }

  openProductModal(button.dataset.productId, button);
}

function handleCartClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) {
    return;
  }

  const { action, itemId } = actionElement.dataset;

  if (action === "close-cart") {
    closeCartPanel();
    return;
  }

  if (action === "clear-cart") {
    const confirmed = window.confirm("¿Vaciar todo el carrito?");
    if (!confirmed) {
      return;
    }

    state.cart = [];
    clearCart();
    syncCart();
    closeCartPanel(false);
    showToast("Carrito vaciado.");
    return;
  }

  if (action === "go-checkout") {
    closeCartPanel(false);
    window.location.hash = "#/checkout";
    return;
  }

  const itemIndex = state.cart.findIndex((item) => item.id === itemId);
  if (itemIndex < 0) {
    return;
  }

  if (action === "remove-item") {
    state.cart.splice(itemIndex, 1);
  } else if (action === "increase-quantity") {
    state.cart[itemIndex].quantity += 1;
  } else if (action === "decrease-quantity") {
    state.cart[itemIndex].quantity -= 1;
    if (state.cart[itemIndex].quantity <= 0) {
      state.cart.splice(itemIndex, 1);
    }
  }

  syncCart();
}

function handleCheckoutSubmit(event) {
  if (event.target.id !== "checkoutForm") {
    return;
  }

  event.preventDefault();
  const form = event.target;

  if (!form.reportValidity()) {
    return;
  }

  if (!navigator.onLine) {
    showToast("Necesitas conexion para abrir WhatsApp.");
    return;
  }

  const formData = new FormData(form);
  state.deliveryAddress = `${formData.get("deliveryAddress")}`.trim();

  const url = buildWhatsAppUrl({
    cart: state.cart,
    deliveryAddress: state.deliveryAddress,
    business: BUSINESS
  });

  window.open(url, "_blank", "noopener,noreferrer");
  showToast("Pedido listo en WhatsApp. El carrito sigue guardado por seguridad.");
}

function handleCheckoutInput(event) {
  if (event.target.id === "deliveryAddress") {
    state.deliveryAddress = event.target.value;
  }
}

function handleCheckoutClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) {
    return;
  }

  if (actionElement.dataset.action === "back-to-menu") {
    window.location.hash = "#/";
  }
}

function handleGlobalKeydown(event) {
  const activePanel = state.activeLayer === "product"
    ? dom.productSheet
    : state.activeLayer === "cart"
      ? dom.cartSheet
      : null;

  if (!activePanel) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeActiveLayer();
    return;
  }

  if (event.key === "Tab") {
    trapFocus(event, activePanel);
  }
}

function updateOfflineStatus() {
  dom.offlineBanner.hidden = navigator.onLine;
  renderCheckoutSection();
}

async function handleInstallClick() {
  if (!state.installPrompt) {
    return;
  }

  state.installPrompt.prompt();
  await state.installPrompt.userChoice;
  state.installPrompt = null;
  dom.installButton.hidden = true;
}

function registerServiceWorker() {
  const isSupportedProtocol = window.location.protocol === "https:" || window.location.hostname === "localhost";

  if (!("serviceWorker" in navigator) || !isSupportedProtocol) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      showToast("No se pudo activar el modo offline en este navegador.");
    });
  });
}

function bindEvents() {
  dom.catalogGrid.addEventListener("click", handleCatalogClick);
  dom.cartButton.addEventListener("click", (event) => openCartPanel(event.currentTarget));
  dom.cartFab.addEventListener("click", (event) => openCartPanel(event.currentTarget));
  dom.heroCartButton.addEventListener("click", (event) => openCartPanel(event.currentTarget));
  dom.scrollMenuButton.addEventListener("click", () => {
    dom.catalogGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  dom.productOverlay.addEventListener("click", (event) => {
    if (event.target === dom.productOverlay || event.target.closest("[data-action='close-product']")) {
      closeProductModal();
    }
  });
  dom.cartOverlay.addEventListener("click", (event) => {
    if (event.target === dom.cartOverlay) {
      closeCartPanel();
    }
  });
  dom.cartSheet.addEventListener("click", handleCartClick);
  dom.checkoutSection.addEventListener("submit", handleCheckoutSubmit);
  dom.checkoutSection.addEventListener("input", handleCheckoutInput);
  dom.checkoutSection.addEventListener("click", handleCheckoutClick);
  dom.installButton.addEventListener("click", handleInstallClick);
  window.addEventListener("hashchange", updateView);
  window.addEventListener("online", updateOfflineStatus);
  window.addEventListener("offline", updateOfflineStatus);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    dom.installButton.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    state.installPrompt = null;
    dom.installButton.hidden = true;
    showToast("App instalada correctamente.");
  });
  document.addEventListener("keydown", handleGlobalKeydown);
}

function init() {
  dom.catalogGrid.innerHTML = renderCatalog(PRODUCTS);
  renderCartPanel();
  renderCheckoutSection();
  updateCartBadges();
  bindEvents();
  updateView();
  updateOfflineStatus();
  registerServiceWorker();
}

if (typeof document !== "undefined") {
  init();
}

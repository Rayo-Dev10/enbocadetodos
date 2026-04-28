import { ADDITION_GROUPS, BUSINESS, PRODUCTS, PROTEIN_OPTIONS, SAUCES } from "./data.js";
import { renderCart } from "./components/cart.js";
import { renderCatalog } from "./components/catalog.js";
import { renderCheckout } from "./components/checkout.js";
import {
  calculateSubtotal,
  getProductSubmitLabel,
  readProductForm,
  renderProductModal
} from "./components/productModal.js";
import { clearCart, loadCart, saveCart } from "./utils/storage.js";
import { buildWhatsAppTargets } from "./utils/whatsapp.js";

const productById = new Map(PRODUCTS.map((product) => [product.id, product]));

const state = {
  cart: (Array.isArray(loadCart()) ? loadCart() : []).map((item) => ({
    ...item,
    mergeable: item.mergeable !== false
  })),
  activeProductId: null,
  modalDraft: null,
  productFlow: null,
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
  deliveryOverlay: document.querySelector("#deliveryOverlay"),
  deliverySheet: document.querySelector("#deliverySheet"),
  heroCartButton: document.querySelector("#heroCartButton"),
  installButton: document.querySelector("#installButton"),
  menuSection: document.querySelector("#menuSection"),
  offlineBanner: document.querySelector("#offlineBanner"),
  orderNowButton: document.querySelector("#orderNowButton"),
  productOverlay: document.querySelector("#productOverlay"),
  productSheet: document.querySelector("#productSheet"),
  quickActions: document.querySelector("#quickActions"),
  scrollMenuButton: document.querySelector("#scrollMenuButton"),
  sectionHeading: document.querySelector(".section-heading"),
  toast: document.querySelector("#toast")
} : null;

const standaloneQuery = typeof window !== "undefined" && window.matchMedia
  ? window.matchMedia("(display-mode: standalone)")
  : null;

function createUniqueId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function isStandaloneApp() {
  return Boolean(
    (standaloneQuery && standaloneQuery.matches) ||
    window.navigator.standalone === true
  );
}

function getDefaultDraft(product) {
  return {
    protein: "",
    finish: product.finishOptions[0] || "",
    sauces: [],
    additions: [],
    quantity: 1,
    splitItems: false
  };
}

function normalizeDraft(selection) {
  return {
    protein: selection.protein || "",
    finish: selection.finish || "",
    sauces: [...selection.sauces].sort((left, right) => left.localeCompare(right)),
    additions: [...selection.additions].sort((left, right) => left.name.localeCompare(right.name))
  };
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

function createCartItem(product, draft, { quantity = 1, mergeable = true } = {}) {
  const normalizedDraft = normalizeDraft(draft);

  return {
    id: createUniqueId(),
    productId: product.id,
    productName: product.name,
    basePrice: product.price,
    protein: normalizedDraft.protein,
    finish: normalizedDraft.finish,
    sauces: normalizedDraft.sauces,
    additions: normalizedDraft.additions,
    subtotal: calculateSubtotal(product.price, normalizedDraft.additions),
    quantity,
    mergeable
  };
}

export function computeCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.subtotal * item.quantity, 0);
}

function countCartUnits(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
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
    if (
      !dom.productOverlay.classList.contains("is-open") &&
      !dom.cartOverlay.classList.contains("is-open") &&
      !dom.deliveryOverlay.classList.contains("is-open")
    ) {
      document.body.classList.remove("body--locked");
    }
  }, 180);
}

function closeProductModal(restoreFocus = true) {
  state.activeProductId = null;
  state.modalDraft = null;
  state.productFlow = null;
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

function closeDeliveryPrompt(restoreFocus = true) {
  hideOverlay(dom.deliveryOverlay);
  state.activeLayer = null;
  dom.deliverySheet.innerHTML = "";

  if (restoreFocus && state.lastFocusedElement instanceof HTMLElement) {
    state.lastFocusedElement.focus();
  }
}

function closeActiveLayer(restoreFocus = true) {
  if (state.activeLayer === "product") {
    closeProductModal(restoreFocus);
  } else if (state.activeLayer === "cart") {
    closeCartPanel(restoreFocus);
  } else if (state.activeLayer === "delivery") {
    closeDeliveryPrompt(restoreFocus);
  }
}

function syncQuickActions() {
  const totalUnits = countCartUnits(state.cart);
  const shouldShow = totalUnits > 0;
  dom.quickActions.hidden = !shouldShow;
}

function updateCartBadges() {
  const totalUnits = countCartUnits(state.cart);
  dom.cartBadgeHeader.textContent = `${totalUnits}`;
  dom.cartBadgeFab.textContent = `${totalUnits}`;
  syncQuickActions();
}

function syncInstallButton() {
  dom.installButton.hidden = isStandaloneApp() || !state.installPrompt;
}

function renderCartPanel() {
  dom.cartSheet.innerHTML = renderCart({
    cart: state.cart,
    total: computeCartTotal(state.cart),
    deliveryAddress: state.deliveryAddress.trim()
  });
}

function renderCheckoutSection() {
  dom.checkoutSection.innerHTML = renderCheckout({
    cart: state.cart,
    total: computeCartTotal(state.cart),
    business: BUSINESS,
    isOnline: navigator.onLine,
    deliveryAddress: state.deliveryAddress
  });
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

function addCartItems(items) {
  items.forEach((item) => {
    if (!item.mergeable) {
      state.cart.push(item);
      return;
    }

    const fingerprint = createCartFingerprint(item);
    const existingIndex = state.cart.findIndex((entry) => entry.mergeable && createCartFingerprint(entry) === fingerprint);

    if (existingIndex >= 0) {
      state.cart[existingIndex].quantity += item.quantity;
    } else {
      state.cart.push(item);
    }
  });
}

function getActiveFlowInfo() {
  if (!state.productFlow) {
    return null;
  }

  return {
    currentStep: state.productFlow.items.length + 1,
    totalQuantity: state.productFlow.totalQuantity
  };
}

function renderActiveProductModal() {
  const product = productById.get(state.activeProductId);
  if (!product) {
    return;
  }

  const flow = getActiveFlowInfo();
  const subtotal = calculateSubtotal(product.price, state.modalDraft.additions);
  const submitLabel = getProductSubmitLabel({
    draft: state.modalDraft,
    subtotal,
    flow
  });

  dom.productSheet.innerHTML = renderProductModal({
    product,
    proteinOptions: PROTEIN_OPTIONS,
    sauces: SAUCES,
    additionGroups: ADDITION_GROUPS,
    draft: state.modalDraft,
    subtotal,
    submitLabel,
    flow
  });

  bindProductModalEvents();
}

function updateProductDraftFromForm(form) {
  const product = productById.get(state.activeProductId);
  if (!product) {
    return;
  }

  state.modalDraft = readProductForm(form, ADDITION_GROUPS, product);
  const subtotal = calculateSubtotal(product.price, state.modalDraft.additions);
  const flow = getActiveFlowInfo();
  const button = form.querySelector("#addToCartButton");

  if (button) {
    button.textContent = getProductSubmitLabel({
      draft: state.modalDraft,
      subtotal,
      flow
    });
  }
}

function adjustBuilderQuantity(delta) {
  const form = dom.productSheet.querySelector("#productForm");
  const input = form?.querySelector("#productQuantity");
  if (!form || !input) {
    return;
  }

  const nextValue = Math.max(1, Math.min(12, Number(input.value || 1) + delta));
  input.value = `${nextValue}`;
  updateProductDraftFromForm(form);
}

function bindProductModalEvents() {
  const form = dom.productSheet.querySelector("#productForm");
  if (!form) {
    return;
  }

  form.addEventListener("input", () => updateProductDraftFromForm(form));
  form.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    if (actionElement.dataset.action === "increase-builder-quantity") {
      adjustBuilderQuantity(1);
    } else if (actionElement.dataset.action === "decrease-builder-quantity") {
      adjustBuilderQuantity(-1);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const product = productById.get(state.activeProductId);
    if (!product) {
      return;
    }

    const draft = readProductForm(form, ADDITION_GROUPS, product);
    const normalizedDraft = normalizeDraft(draft);

    if (state.productFlow) {
      state.productFlow.items.push(normalizedDraft);

      if (state.productFlow.items.length < state.productFlow.totalQuantity) {
        state.modalDraft = {
          ...normalizedDraft,
          quantity: state.productFlow.totalQuantity,
          splitItems: true
        };
        renderActiveProductModal();
        showToast(`Personaliza la arepa ${state.productFlow.items.length + 1} de ${state.productFlow.totalQuantity}.`);
        return;
      }

      const newItems = state.productFlow.items.map((itemDraft) =>
        createCartItem(product, itemDraft, { quantity: 1, mergeable: false })
      );

      addCartItems(newItems);
      syncCart();
      closeProductModal(false);
      showToast("Pedido agregado al carrito.");
      return;
    }

    if (draft.splitItems && draft.quantity > 1) {
      state.productFlow = {
        productId: product.id,
        totalQuantity: draft.quantity,
        items: [normalizedDraft]
      };
      state.modalDraft = {
        ...normalizedDraft,
        quantity: draft.quantity,
        splitItems: true
      };
      renderActiveProductModal();
      showToast(`Personaliza la arepa 2 de ${draft.quantity}.`);
      return;
    }

    addCartItems([
      createCartItem(product, normalizedDraft, {
        quantity: draft.quantity,
        mergeable: true
      })
    ]);
    syncCart();
    closeProductModal(false);
    showToast("Pedido agregado al carrito.");
  });
}

function openProductModal(productId, triggerElement) {
  const product = productById.get(productId);
  if (!product) {
    return;
  }

  state.activeProductId = productId;
  state.productFlow = null;
  state.modalDraft = getDefaultDraft(product);
  renderActiveProductModal();
  openLayer("product", dom.productOverlay, dom.productSheet, triggerElement);
}

function openCartPanel(triggerElement) {
  renderCartPanel();
  openLayer("cart", dom.cartOverlay, dom.cartSheet, triggerElement);
}

function renderDeliveryPrompt() {
  dom.deliverySheet.innerHTML = `
    <div class="sheet__header">
      <div>
        <p class="eyebrow">Antes de ordenar</p>
        <h2 id="deliverySheetTitle">¿Dónde entregamos tu pedido?</h2>
      </div>
      <button class="icon-button" type="button" data-action="close-delivery" aria-label="Cerrar pedido">
        Cerrar
      </button>
    </div>

    <form class="prompt-form" id="deliveryForm">
      <label class="field" for="deliveryAddressPrompt">
        <span>Lugar de entrega</span>
        <textarea
          id="deliveryAddressPrompt"
          name="deliveryAddressPrompt"
          rows="4"
          minlength="10"
          maxlength="180"
          required
          placeholder="Ej: Casa de Mauricio Hoyos, frente al parque">${state.deliveryAddress}</textarea>
      </label>

      <p class="checkout-note">
        En cuanto confirmes este dato, te llevamos directo a WhatsApp con el pedido ya armado.
      </p>

      <button class="btn btn--primary btn--full" type="submit">
        Ordenar ahora
      </button>
    </form>
  `;

  const form = dom.deliverySheet.querySelector("#deliveryForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const field = form.querySelector("#deliveryAddressPrompt");

    if (!field.reportValidity()) {
      field.focus();
      return;
    }

    state.deliveryAddress = field.value.trim();
    renderCheckoutSection();
    closeDeliveryPrompt(false);
    openWhatsAppFlow();
  });
}

function openDeliveryPrompt(triggerElement) {
  renderDeliveryPrompt();
  openLayer("delivery", dom.deliveryOverlay, dom.deliverySheet, triggerElement);
  const field = dom.deliverySheet.querySelector("#deliveryAddressPrompt");
  if (field) {
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }
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

function launchExternalUrlWithFallback(primaryUrl, fallbacks) {
  let resolved = false;
  const cleanup = () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("pagehide", markResolved);
    window.removeEventListener("blur", markResolved);
  };
  const markResolved = () => {
    resolved = true;
    cleanup();
  };
  const handleVisibility = () => {
    if (document.hidden) {
      markResolved();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("pagehide", markResolved);
  window.addEventListener("blur", markResolved);

  const queue = [primaryUrl, ...fallbacks];
  queue.forEach((url, index) => {
    window.setTimeout(() => {
      if (!resolved) {
        window.location.href = url;
      }
    }, index * 900);
  });

  window.setTimeout(() => {
    cleanup();
  }, queue.length * 950);
}

function openWhatsAppFlow() {
  if (!state.cart.length) {
    showToast("Primero agrega al menos una arepa.");
    return;
  }

  const deliveryAddress = state.deliveryAddress.trim();
  if (deliveryAddress.length < 10) {
    openDeliveryPrompt(dom.orderNowButton || dom.cartButton);
    return;
  }

  if (!navigator.onLine) {
    showToast("Necesitas conexión para ordenar por WhatsApp.");
    return;
  }

  const targets = buildWhatsAppTargets({
    cart: state.cart,
    deliveryAddress,
    business: BUSINESS
  });

  const userAgent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSamsungBrowser = /SamsungBrowser/i.test(userAgent);
  const isChromiumAndroid = isAndroid && /Chrome|CriOS|EdgA|OPR|Brave/i.test(userAgent) && !isSamsungBrowser;

  if (isChromiumAndroid) {
    launchExternalUrlWithFallback(targets.intentUrl, [targets.schemeUrl, targets.apiUrl, targets.httpsUrl]);
  } else if (isIOS) {
    launchExternalUrlWithFallback(targets.schemeUrl, [targets.apiUrl, targets.httpsUrl]);
  } else if (isAndroid) {
    launchExternalUrlWithFallback(targets.schemeUrl, [targets.apiUrl, targets.httpsUrl]);
  } else {
    window.location.href = targets.httpsUrl;
  }

  showToast("Intentando abrir WhatsApp con tu pedido.");
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

  if (action === "order-now") {
    closeCartPanel(false);
    openWhatsAppFlow();
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
  const formData = new FormData(form);
  const nextAddress = `${formData.get("deliveryAddress")}`.trim();

  if (nextAddress.length < 10) {
    openDeliveryPrompt(form.querySelector("#deliveryAddress"));
    return;
  }

  state.deliveryAddress = nextAddress;
  openWhatsAppFlow();
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
      : state.activeLayer === "delivery"
        ? dom.deliverySheet
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
  if (!state.installPrompt || isStandaloneApp()) {
    return;
  }

  state.installPrompt.prompt();
  await state.installPrompt.userChoice;
  state.installPrompt = null;
  syncInstallButton();
}

function registerServiceWorker() {
  const isSupportedProtocol = window.isSecureContext;

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
  dom.orderNowButton.addEventListener("click", (event) => {
    event.preventDefault();
    openWhatsAppFlow();
  });
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
  dom.deliveryOverlay.addEventListener("click", (event) => {
    if (event.target === dom.deliveryOverlay || event.target.closest("[data-action='close-delivery']")) {
      closeDeliveryPrompt();
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
    syncInstallButton();
  });
  window.addEventListener("appinstalled", () => {
    state.installPrompt = null;
    syncInstallButton();
    showToast("App instalada correctamente.");
  });
  if (standaloneQuery?.addEventListener) {
    standaloneQuery.addEventListener("change", syncInstallButton);
  }
  document.addEventListener("keydown", handleGlobalKeydown);
}

function init() {
  dom.catalogGrid.innerHTML = renderCatalog(PRODUCTS);
  renderCartPanel();
  renderCheckoutSection();
  updateCartBadges();
  syncInstallButton();
  bindEvents();
  updateView();
  updateOfflineStatus();
  registerServiceWorker();
}

if (typeof document !== "undefined") {
  init();
}

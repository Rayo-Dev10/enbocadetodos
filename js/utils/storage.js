const CART_KEY = "ebdt_cart";

function isStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCart() {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function saveCart(cart) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    // Ignore storage errors so the ordering flow keeps working.
  }
}

export function clearCart() {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(CART_KEY);
  } catch (error) {
    // Ignore storage errors so the ordering flow keeps working.
  }
}

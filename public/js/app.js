// Shared utilities: cart management, UI helpers

const CART_KEY = 'shopzo_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((acc, it) => acc + it.quantity, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const idx = cart.findIndex(it => it.productId === product.id);
  if (idx >= 0) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  }
  saveCart(cart);
}

function updateQuantity(productId, quantity) {
  const cart = getCart();
  const idx = cart.findIndex(it => it.productId === productId);
  if (idx >= 0) {
    cart[idx].quantity = Math.max(1, quantity);
    saveCart(cart);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(it => it.productId !== productId);
  saveCart(cart);
}

function formatCurrency(n) {
  return `₹${n.toFixed(2)}`;
}

function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  updateCartCount();
});

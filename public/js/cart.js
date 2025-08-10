function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-container');

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  let subtotal = 0;
  const itemsHtml = cart.map(it => {
    const line = it.price * it.quantity;
    subtotal += line;
    return `
      <div class="cart-item">
        <img src="${it.image}" alt="${it.name}" />
        <div>
          <div><strong>${it.name}</strong></div>
          <div class="muted">${formatCurrency(it.price)} each</div>
        </div>
        <div>
          <input type="number" min="1" value="${it.quantity}" data-qty="${it.productId}" style="width:70px;" />
        </div>
        <div>
          <div>${formatCurrency(line)}</div>
          <button class="btn danger" data-remove="${it.productId}" style="margin-top:6px;">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  const summaryHtml = `
    <div class="cart-summary">
      <div style="display:flex; justify-content:space-between;">
        <span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong>
      </div>
      <div class="muted" style="margin-top:6px;">Taxes and shipping calculated at checkout</div>
    </div>
  `;

  container.innerHTML = itemsHtml + summaryHtml;

  container.addEventListener('change', (e) => {
    const id = e.target.getAttribute('data-qty');
    if (id) {
      const qty = Math.max(1, parseInt(e.target.value || '1', 10));
      updateQuantity(Number(id), qty);
      renderCart();
    }
  });

  container.addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-remove');
    if (id) {
      removeFromCart(Number(id));
      renderCart();
    }
  });
}

async function placeOrder(evt) {
  evt.preventDefault();
  const cart = getCart();
  const result = document.getElementById('order-result');

  if (cart.length === 0) {
    result.textContent = 'Your cart is empty.';
    return;
  }

  const payload = {
    customer: {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim()
    },
    items: cart.map(it => ({
      productId: it.productId,
      quantity: it.quantity
    }))
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      result.textContent = data.error || 'Failed to place order.';
      return;
    }
    result.innerHTML = `
      <div style="padding:10px; border:1px solid #2a324f; border-radius:8px;">
        <p>Thank you! Your order has been placed.</p>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Total:</strong> ${formatCurrency(data.total)}</p>
      </div>
    `;
    // Clear cart
    saveCart([]);
    renderCart();
  } catch (e) {
    result.textContent = 'An error occurred while placing the order.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  document.getElementById('checkout-form').addEventListener('submit', placeOrder);
});

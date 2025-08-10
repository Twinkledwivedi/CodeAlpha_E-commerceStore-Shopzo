function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function fetchProduct(id) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

async function render() {
  const id = getParam('id');
  const container = document.getElementById('product-detail');
  if (!id) {
    container.innerHTML = '<p>Missing product id.</p>';
    return;
  }

  try {
    const p = await fetchProduct(id);
    container.innerHTML = `
      <div>
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div>
        <h1>${p.name}</h1>
        <p class="muted">In stock: ${p.stock}</p>
        <p class="price">${formatCurrency(p.price)}</p>
        <p style="margin-top:8px;">${p.description}</p>

        <div style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <label for="qty">Qty</label>
          <input id="qty" type="number" min="1" max="${p.stock}" value="1" style="width:80px;" />
          <button id="add-btn" class="btn primary">Add to cart</button>
        </div>
      </div>
    `;

    document.getElementById('add-btn').addEventListener('click', () => {
      const qty = Math.max(1, parseInt(document.getElementById('qty').value || '1', 10));
      addToCart(p, qty);
    });
  } catch (e) {
    container.innerHTML = '<p>Product not found.</p>';
  }
}

render();

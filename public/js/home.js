async function fetchProducts() {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

function productCard(p) {
  return `
    <article class="card">
      <img src="${p.image}" alt="${p.name}" />
      <div class="content">
        <h3><a href="/product.html?id=${p.id}">${p.name}</a></h3>
        <div class="muted">In stock: ${p.stock}</div>
        <div class="price">${formatCurrency(p.price)}</div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <a class="btn" href="/product.html?id=${p.id}">View</a>
          <button class="btn primary" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `;
}

async function render() {
  const grid = document.getElementById('product-grid');
  try {
    const products = await fetchProducts();
    grid.innerHTML = products.map(productCard).join('');
    grid.addEventListener('click', async (e) => {
      const id = e.target.getAttribute && e.target.getAttribute('data-add');
      if (id) {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) return alert('Product not found');
        const p = await res.json();
        addToCart(p, 1);
      }
    });
  } catch (e) {
    grid.innerHTML = `<p>Failed to load products.</p>`;
  }
}

render();

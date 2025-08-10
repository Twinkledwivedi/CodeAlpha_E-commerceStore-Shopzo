import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

const app = express();
const PORT = process.env.PORT || 3000;

// Load products in memory and allow stock updates
const productsPath = join(__dirname, 'products.json');
let PRODUCTS = JSON.parse(readFileSync(productsPath, 'utf-8'));

// Ensure orders file exists
const ordersPath = join(__dirname, 'orders.json');
if (!existsSync(ordersPath)) writeFileSync(ordersPath, '[]', 'utf-8');

app.use(express.json());

// Serve static frontend
app.use(express.static(join(__dirname, '..', 'public')));

// API: list products
app.get('/api/products', (req, res) => {
  const list = PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    image: p.image
  }));
  res.json(list);
});

// API: product details
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// API: process order
// Expected body: { customer: { name, email, address }, items: [{ productId, quantity }] }
app.post('/api/orders', (req, res) => {
  try {
    const { customer, items } = req.body || {};
    if (!customer || !customer.name || !customer.email || !customer.address) {
      return res.status(400).json({ error: 'Missing customer info' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    // Validate items, compute total, check stock
    let total = 0;
    const normalized = [];

    for (const it of items) {
      const pid = Number(it.productId);
      const qty = Number(it.quantity);
      if (!Number.isInteger(pid) || !Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Invalid item in order' });
      }
      const product = PRODUCTS.find(p => p.id === pid);
      if (!product) {
        return res.status(400).json({ error: `Product ${pid} not found` });
      }
      if (product.stock < qty) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      const lineTotal = +(product.price * qty).toFixed(2);
      total += lineTotal;
      normalized.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        lineTotal
      });
    }

    total = +total.toFixed(2);

    // Reduce stock and persist products
    for (const it of normalized) {
      const idx = PRODUCTS.findIndex(p => p.id === it.productId);
      PRODUCTS[idx].stock -= it.quantity;
    }
    writeFileSync(productsPath, JSON.stringify(PRODUCTS, null, 2), 'utf-8');

    // Create order
    const order = {
      id: nanoid(10),
      createdAt: new Date().toISOString(),
      customer,
      items: normalized,
      total
    };

    const existing = JSON.parse(readFileSync(ordersPath, 'utf-8'));
    existing.push(order);
    writeFileSync(ordersPath, JSON.stringify(existing, null, 2), 'utf-8');

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order.id,
      total: order.total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error processing order' });
  }
});

// Fallback to SPA-like routing for static pages if needed
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Shopzo server running at http://localhost:${PORT}`);
});

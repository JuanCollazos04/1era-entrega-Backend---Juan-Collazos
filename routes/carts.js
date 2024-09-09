const express = require('express');
const fs = require('fs');
const router = express.Router();
const filePath = './data/carrito.json';

const readData = () => JSON.parse(fs.readFileSync(filePath));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

router.post('/', (req, res) => {
  const carritos = readData();
  const newCart = {
    id: carritos.length ? carritos[carritos.length - 1].id + 1 : 1,
    products: []
  };
  carritos.push(newCart);
  writeData(carritos);
  res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
  const carritos = readData();
  const cart = carritos.find(c => c.id == req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart.products);
});

router.post('/:cid/product/:pid', (req, res) => {
  const carritos = readData();
  const { cid, pid } = req.params;
  const cartIndex = carritos.findIndex(c => c.id == cid);
  if (cartIndex === -1) return res.status(404).json({ error: 'Carrito no encontrado' });

  const cart = carritos[cartIndex];
  const productInCart = cart.products.find(p => p.product == pid);

  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }

  writeData(carritos);
  res.status(201).json(cart);
});

module.exports = router;

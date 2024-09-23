const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const filePath = path.join(__dirname, '../data/carrito.json');

  const readData = () => {
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath));
      } catch (error) {
        console.error('Error al leer el archivo de carritos:', error);
        return [];
      }
    } else {
      return [];
    }
  };

  const writeData = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir el archivo de carritos:', err);
      }
    });
  };

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

  router.delete('/:cid/product/:pid', (req, res) => {
    const carritos = readData();
    const { cid, pid } = req.params;
    const cartIndex = carritos.findIndex(c => c.id == cid);

    if (cartIndex === -1) return res.status(404).json({ error: 'Carrito no encontrado' });

    const cart = carritos[cartIndex];
    const productIndex = cart.products.findIndex(p => p.product == pid);

    if (productIndex === -1) return res.status(404).json({ error: 'Producto no encontrado en el carrito' });

    cart.products.splice(productIndex, 1);
    writeData(carritos);
    res.status(204).send();
  });

module.exports = router;
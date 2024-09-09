const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = './data/productos.json';
const productsFilePath = path.join(__dirname, 'productos.json');

function readProducts() {
  if (fs.existsSync(productsFilePath)) {
      try {
          return JSON.parse(fs.readFileSync(productsFilePath));
      } catch (error) {
          console.error('Error al leer el archivo de productos:', error);
          return [];
      }
  } else {
      return [];
  }
}
function writeProducts(products) {
  fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
          console.error('Error al escribir el archivo de productos:', err);
      }
  });
}

router.get('/', (req, res) => {
  const limit = req.query.limit;
  const productos = readProducts();
  if (limit) {
    return res.json(productos.slice(0, limit));
  }
  res.json(productos);
});

router.get('/:pid', (req, res) => {
  const productos = readProducts();
  const product = productos.find(p => p.id == req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

router.post('/', (req, res) => {
  const productos = readProducts();
  const { title, description, price, stock, category, thumbnails } = req.body;
  console.log("Recibido:", req.body);

  if (!title || !description || !price || !stock || !category) {
    console.log("Faltan campos obligatorios");
    return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
  }

  const products = readProductsFile();
    console.log("Productos actuales:", products);

  const newProduct = {
    id: productos.length ? productos[productos.length - 1].id + 1 : 1,
    title,
    description,
    price,
    stock,
    category,
    thumbnails: thumbnails || []
  };

  productos.push(newProduct);
  writeProducts(productos);
    console.log("Nuevo producto añadido:", newProduct);
    res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
  const productos = readProducts();
  const { pid } = req.params;
  const { title, description, price, stock, category, thumbnails } = req.body;

  const index = productos.findIndex(p => p.id == pid);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const updatedProduct = { ...productos[index], title, description, price, stock, category, thumbnails };
  productos[index] = updatedProduct;
  writeProducts(productos);
  res.json(updatedProduct);
});

router.delete('/:pid', (req, res) => {
  let productos = readProducts();
  const { pid } = req.params;
  const productExists = productos.some(p => p.id == pid);

  if (!productExists) return res.status(404).json({ error: 'Producto no encontrado' });

  productos = productos.filter(p => p.id != pid);
  writeProducts(productos);
  res.status(204).send();
});

module.exports = router;

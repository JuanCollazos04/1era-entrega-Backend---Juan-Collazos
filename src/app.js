const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

  app.engine('handlebars', exphbs());
  app.set('view engine', 'handlebars');

  const server = http.createServer(app);
  const io = socketIo(server);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/products', productsRouter);
  app.use('/api/carts', cartsRouter);

  app.get('/', (req, res) => {
    const productos = readProducts();
    res.render('home', { products: productos });
  });

  app.get('/realtimeproducts', (req, res) => {
    const productos = readProducts();
    res.render('realTimeProducts', { products: productos });
  });

  io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('newProduct', (product) => {
      const productos = readProducts();
      product.id = productos.length ? productos[productos.length - 1].id + 1 : 1;
      productos.push(product);
      writeProducts(productos);
      io.emit('updateProducts', productos);
    });

    socket.on('deleteProduct', (productId) => {
      let productos = readProducts();
      productos = productos.filter(p => p.id != productId);
      writeProducts(productos);
      io.emit('updateProducts', productos);
      socket.emit('productDeleted', productId);
    });
  });

  const productsFilePath = path.join(__dirname, '../data/productos.json');
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
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir el archivo de productos:', err);
      }
    });
  }

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
const express = require('express');
const app = express();
const PORT = 8080;

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use(express.json());

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
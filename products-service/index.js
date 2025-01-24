const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth.js');
dotenv.config();

const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
}));

const app = express();
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Products service conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas protegidas
app.get('/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.status(500).send({ error: 'Error al obtener los productos.' });
  }
});

app.post('/products', authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).send(newProduct);
  } catch (err) {
    res.status(500).send({ error: 'Error al crear el producto.' });
  }
});

app.listen(3000, () => console.log('Products service escuchando en http://localhost:3001'));
const express = require ('express');
const mongoose = require ('mongoose');
const dotenv = require ('dotenv');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const User = require ('./models/user.js');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Auth service conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Verificar token
app.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.send({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).send({ error: 'Token inválido.' });
  }
});

app.listen(3000, () => console.log('Auth service escuchando en http://localhost:3002'));

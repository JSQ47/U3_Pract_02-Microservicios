const express = require ('express');
const mongoose = require ('mongoose');
const dotenv = require ('dotenv');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const User = require ('./models/user.js');
const authMiddleware = require('./middleware/auth.js');
dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Auth service conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Registro de usuario
app.post('/user/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).send({ error: 'Email y contraseña son obligatorios.' });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).send({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    res.status(500).send({ error: 'Error al registrar el usuario.' });
  }
});

// Inicio de sesión
app.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.send({ token });
  } catch (err) {
    res.status(500).send({ error: 'Error al iniciar sesión.' });
  }
});

app.get("/user/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los usuarios." });
  }
});


app.listen(3000, () => console.log('Auth service escuchando en http://localhost:3000'));

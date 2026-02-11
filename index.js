const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const methodOverride = require('method-override');

// 👉 Carga variables de entorno PRIMERO
require('dotenv').config();

// 👉 Conexión a MongoDB y carga de modelos
const mongoose = require('mongoose');
require('./config/db'); // Esto carga los modelos

// ✅ AHORA SÍ carga passport (después de los modelos)
const passport = require('./config/passport');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(expressValidator());
app.use(methodOverride('_method'));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secreto',
    key: 'password',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Variables globales
app.use((req, res, next) => {
  res.locals.usuario = req.user || null;
  res.locals.mensajes = req.flash();
  next();
});

// Vistas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Rutas
const routes = require('./routes');
app.use('/', routes());

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
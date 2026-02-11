const mongoose = require('mongoose');
require('dotenv').config();

console.log("Mongo URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

mongoose.connection.on('connected', () => {
  console.log('Mongoose: conexión establecida');
});

mongoose.connection.on('error', err => {
  console.error('Mongoose error:', err);
});

// modelos
require('../Modelos/Usuarios');
require('../Modelos/Productos');
require('../Modelos/Direcciones');
require('../Modelos/Ordenes');
require('../Modelos/PedidoDetalle');


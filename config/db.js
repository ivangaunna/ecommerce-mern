const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ivangaunna:AndreaVega1@tiendacluster.s0qzf.mongodb.net/TiendaVirtual',);


mongoose.connection.on('error',(error) =>{
    console.log(error);
})

// Importar Modelos
require('../Modelos/Usuarios');
require('../Modelos/Productos');
require('../Modelos/Direcciones');
require('../Modelos/Ordenes');

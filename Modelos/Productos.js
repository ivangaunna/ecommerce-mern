const mongoose = require('mongoose');

const ProductosSchema = new mongoose.Schema({
    Titulo:{
        type:String,
        required:'El Titulo del producto es obligatorio' // Cambié require por required
    },
    Precio:{
        type:mongoose.Schema.Types.Decimal128, // Corrección en la definición del tipo
        required:'El Precio del producto es obligatorio'
    },
    Cantidad:{
        type:Number
    },
    Imagen:{
        type:String
    }
})

module.exports = mongoose.model('Productos',ProductosSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PedidoDetalleSchema = new Schema({
  ordenId: { type: Schema.Types.ObjectId, ref: 'Ordenes', required: true },
  productoId: { type: Schema.Types.ObjectId, ref: 'Productos', required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true }
});

module.exports = mongoose.model('PedidoDetalle', PedidoDetalleSchema);

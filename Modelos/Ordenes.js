const mongoose = require('mongoose');

const OrdenesSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  Payment_id: {
    type: Number,
    unique: true,
    required: true
  },
  Status: {
    type: String,
    required: true
  },
  TipoEnvio: {
    type: Number,
    required: true
  },
  FechaCompra: {
    type: Date,
    default: Date.now
  },
  Payment_type: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Ordenes', OrdenesSchema);

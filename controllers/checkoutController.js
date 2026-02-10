const DireccionBD = require('../Modelos/Direcciones');
const Usuarios = require('../Modelos/Usuarios');
const ProductosBD = require('../Modelos/Productos');
const Ordenes = require('../Modelos/Ordenes');
const PedidoDetalle = require('../Modelos/PedidoDetalle');

// Importar Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Agregar Credenciales
const client = new MercadoPagoConfig({ accessToken: 'TEST-5060180468859910-062015-164eeffcd077360d42b143ad07138778-452260651' });

exports.mostrarCarrito = (req, res) => {
    res.render('Carrito');
};

exports.DatosdeCompra = async (req, res) => {
    const UsuarioId = req.user._id;
    const Direcciones = await DireccionBD.find({ UsuarioId });
    const { Nombre, Email } = req.user;
    res.render('DatosEntrega', {
        Direcciones,
        Nombre,
        Email
    });
};

exports.TomarDirecciones = async (req, res) => {
    const Direcciones = await DireccionBD.find();
    res.send(Direcciones);
};

exports.TipoEnvio = async (req, res) => {
    res.render('TipoEnvio');
};

// Pasarela de Pago
exports.PasareladePago = (req, res) => {
    res.render('PasarelaDePago');
};

exports.mostrarCheckoutMP = async (req, res, next) => {
    try {
        const Productos = req.body.Productos;
        const Direccion = req.body.Direccion;
        const TipoEnvio = req.body.TipoEnvio;

        // Guarda en sesión para usar en FinalizarCompra
        req.session.productosComprados = Productos;
        req.session.tipoEnvio = TipoEnvio;

        const Email = req.session.passport.user.Email;
        const usuario = await Usuarios.findOne({ Email });
        const productoBD = await ProductosBD.find();

        let items = [];
        for (let i = 0; i < Productos.length; i++) {
            const id = Productos[i].id;
            let Precio;
            productoBD.forEach(p => {
                if (id == p._id.toString()) Precio = p.Precio;
            });

            items.push({
                id, // Guarda el id para luego
                title: Productos[i].Nombre,
                unit_price: Number(Precio),
                currency_id: 'ARS',
                quantity: Number(Productos[i].Cantidad)
            });
        }

        let preference = {
            items: items,
            back_urls: {
                success: `//localhost:3000/success`,
                failure: `//localhost:3000/rejected`,
                pending: `//localhost:3000/feedback`,
            },
            auto_return: 'approved',
            payer: {
                name: usuario.Nombre,
                email: usuario.Email,
                phone: {
                    area_code: '11',
                    number: Number(Direccion.Telefono)
                },
                address: {
                    street_name: Direccion.Calle,
                    zip_code: Direccion.CP
                }
            },
            shipments: {
                cost: 0,
                mode: 'not_specified'
            },
            metadata: {
                // Opcional: puedes guardar info extra aquí
            }
        };

        const result = await new Preference(client).create({ body: preference });
        res.json({ init_point: result.sandbox_init_point });
    } catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(500).send("Error interno al generar el checkout");
    }
};

exports.FinalizarCompra = async (req, res) => {
    try {
        const Email = req.session.passport.user.Email;
        const usuario = await Usuarios.findOne({ Email });

        const paymentData = req.query;

        if (paymentData.status !== 'approved') {
            return res.redirect('/rejected');
        }

        const payment_id = paymentData.payment_id;
        const payment_type = paymentData.payment_type;

        // Recupera productos y tipo de envío de la sesión
        const Productos = req.session.productosComprados || [];
        const TipoEnvio = req.session.tipoEnvio || {};

        // Calcular total
        let total = 0;
        for (let p of Productos) {
            const producto = await ProductosBD.findById(p.id);
            if (!producto) continue;
            const precio = parseFloat(producto.Precio.toString());
            total += precio * p.Cantidad;
        }

        // Crear la orden con usuarioId y total
        const orden = new Ordenes({
            usuarioId: usuario._id,
            Payment_id: payment_id,
            Status: 'aprobado',
            TipoEnvio: TipoEnvio.TipoEntrega,
            FechaCompra: new Date(),
            Payment_type: payment_type,
            total: total
        });

        const ordenGuardada = await orden.save();

        // Guardar los detalles del pedido
        for (let p of Productos) {
            const producto = await ProductosBD.findById(p.id);
            if (!producto) continue;

            const precio = parseFloat(producto.Precio.toString());

            const detalle = new PedidoDetalle({
                ordenId: ordenGuardada._id,
                productoId: producto._id,
                cantidad: p.Cantidad,
                precioUnitario: precio
            });
            await detalle.save();
        }

        // Limpiar la sesión
        req.session.productosComprados = null;
        req.session.tipoEnvio = null;

        res.redirect('/mi-cuenta');
    } catch (error) {
        console.error('Error al finalizar la compra:', error);
        res.redirect('/');
    }
};


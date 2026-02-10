
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const tiendaController = require('../controllers/tiendaController');
const administracionController = require('../controllers/administracionController');
const checkoutController = require('../controllers/checkoutController');

module.exports = function() {
    //seccion cuentas
    router.get('/', homeController.Home);
    router.route('/crear-cuenta')
        .get(usuariosController.formCrearUsuario)
        .post(
            usuariosController.validarRegistro,
            usuariosController.CrearUsuario
        );

    router.route('/iniciar-sesion')
        .get(usuariosController.formIniciarSesion)
        .post(authController.autenticarUsuario);

    router.get('/cerrar-sesion', 
        authController.usuarioAutenticado, 
        authController.cerrarSesion
    );


    // Sección Administración de Cuenta
    router.get('/mi-cuenta', 
        authController.usuarioAutenticado, 
        administracionController.MiCuenta
    );

    router.route('/mis-datos')
        .get(
            authController.usuarioAutenticado, 
            administracionController.formEditarDatos
        )
        .post(
            authController.usuarioAutenticado, 
            administracionController.EditarDatos
        );

    // Rutas de Direcciones
    router.route('/direcciones')
        .get(
            authController.usuarioAutenticado, 
            administracionController.Direcciones
        );

    router.route('/direcciones/Agregar')
        .get(
            authController.usuarioAutenticado, 
            administracionController.formAgregarDireccion
        )
        .post(
            authController.usuarioAutenticado, 
            administracionController.AgregarDireccion
        );

    router.route('/direcciones/Editar/:id')
        .get(
            authController.usuarioAutenticado, 
            administracionController.formEditarDireccion
        )
        .post(
            authController.usuarioAutenticado, 
            administracionController.EditarDireccion
        );

    router.delete('/direcciones/Eliminar/:Id', 
        authController.usuarioAutenticado, 
        administracionController.EliminarDireccion
    );

    // Sección Tienda
    router.get('/Tienda', tiendaController.CrearTienda);
    

    // Rutas de Productos (con protección de Admin)
    router.get('/CrearProducto', 
        authController.usuarioAutenticado,  
        authController.esAdmin,             
        tiendaController.formCrearProducto
    );
    
    router.post('/Producto/Crear', 
        authController.usuarioAutenticado,  
        authController.esAdmin,            
        tiendaController.CrearProducto
    );
    router.delete('/Producto/Eliminar/:id', 
        authController.usuarioAutenticado,  
        authController.esAdmin,            
        tiendaController.EliminarProducto
    );
        // Ruta para el formulario de edición de producto
router.get('/Producto/Editar/:id', 
    authController.usuarioAutenticado,  
    authController.esAdmin,            
    tiendaController.formEditarProducto
);

// Ruta para procesar la edición de producto
router.post('/Producto/Editar/:id', 
    authController.usuarioAutenticado,  
    authController.esAdmin,            
    tiendaController.EditarProducto
);

    // Sección Carrito y Checkout
    router.get('/carrito', checkoutController.mostrarCarrito);

    router.get('/Datos-Compra', 
        authController.usuarioAutenticado,
        checkoutController.DatosdeCompra
    );

    router.get('/TomarDirecciones', 
        authController.usuarioAutenticado,
        checkoutController.TomarDirecciones
    );

    router.get('/Tipo-Envio', 
        authController.usuarioAutenticado,
        checkoutController.TipoEnvio
    );

    // Pasarela de Pago
    router.get('/pasarela', 
        authController.usuarioAutenticado,
        checkoutController.PasareladePago
    );

    router.post('/checkout', 
        authController.usuarioAutenticado,
        checkoutController.mostrarCheckoutMP
    );

   

// Tipo de valores de pago

    router.get('/success',
    authController.usuarioAutenticado,
    checkoutController.FinalizarCompra
    )
    router.get('/rejected',
    authController.usuarioAutenticado,
    checkoutController.FinalizarCompra
    )



    return router;
}
const productos = require('../Modelos/Productos');
const upload = require('../config/multerConfig');
const fs = require('fs'); // Para manejar el sistema de archivos

exports.CrearTienda = async (req, res, next) => {
    try {
        const Productos = await productos.find();

        if (!Productos || Productos.length === 0) {
            return res.render('Tienda', {
                Productos: [],
                mensaje: 'No hay productos disponibles'
            });
        }

        res.render('Tienda', {
            Productos
        });
    } catch (error) {
        console.error('Error al cargar tienda:', error);
        next(error);
    }
}

exports.ProductoUrl = async (req, res, next) => {
    try {
        const Producto = await productos.findOne({ Imagen: req.params.Url });
        
        if (!Producto) {
            return next(new Error('Producto no encontrado'));
        }

        res.render('Producto', {
            Producto
        });
    } catch (error) {
        console.error('Error al buscar producto:', error);
        next(error);
    }
}

exports.formCrearProducto = (req, res) => {
    res.render('CrearProducto', {
        pagina: 'Crear Producto'
    });
};

exports.CrearProducto = async (req, res, next) => {
    upload.single('Imagen')(req, res, async (err) => {
        try {
            // Manejar errores de Multer
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/CrearProducto');
            }

            const { Titulo, Precio, Cantidad } = req.body;

            // Validaciones
            if (!Titulo || !Precio) {
                req.flash('error', 'El título y precio son obligatorios');
                return res.redirect('/CrearProducto');
            }

            const nuevoProducto = new productos({
                Titulo,
                Precio: parseFloat(Precio),
                Cantidad: Cantidad || 0,
                Imagen: req.file ? `/img/celulares/${req.file.filename}` : ''
            });

            await nuevoProducto.save();
            
            req.flash('correcto', 'Producto creado exitosamente');
            res.redirect('/Tienda');
        } catch (error) {
            console.error('Error al crear producto:', error);
            req.flash('error', 'Hubo un error al crear el producto');
            res.redirect('/CrearProducto');
        }
    });
};

// Editar Producto
exports.formEditarProducto = async (req, res, next) => {
    try {
        const Producto = await productos.findOne({ _id: req.params.id });
        
        if (!Producto) {
            return next(new Error('Producto no encontrado'));
        }
        
        res.render('EditarProducto', {
            Producto
        });
    } catch (error) {
        console.error('Error al cargar edición de producto:', error);
        next(error);
    }
}


exports.EditarProducto = async (req, res, next) => {
    upload.single('Imagen')(req, res, async (err) => {
        try {
            // Manejar errores de Multer
            if (err) {
                req.flash('error', err.message);
                return res.redirect(`/Producto/Editar/${req.params.id}`);
            }

            const { Titulo, Precio, Cantidad } = req.body;

            // Obtener el producto actual para manejar la imagen antigua
            const Producto = await productos.findById(req.params.id);
            if (!Producto) {
                req.flash('error', 'Producto no encontrado');
                return res.redirect('/Tienda');
            }

            const updateData = { 
                Titulo, 
                Precio, 
                Cantidad 
            };

            // Si se sube una nueva imagen, actualizamos la ruta
            if (req.file) {
                // Ruta relativa de la nueva imagen
                const nuevaRuta = `/img/celulares/${req.file.filename}`;
                updateData.Imagen = nuevaRuta;

                // Eliminar la imagen anterior si existe
                if (Producto.Imagen) {
                    const rutaAntigua = `./public${Producto.Imagen}`;
                    fs.unlink(rutaAntigua, (err) => {
                        if (err) console.error('Error al eliminar la imagen anterior:', err);
                    });
                }
            }

            // Actualizar el producto en la base de datos
            const productoActualizado = await productos.findOneAndUpdate(
                { _id: req.params.id },
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!productoActualizado) {
                req.flash('error', 'No se pudo actualizar el producto');
                return res.redirect('/Tienda');
            }

            req.flash('correcto', 'Cambios guardados correctamente');
            res.redirect('/Tienda');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            req.flash('error', 'Hubo un error al guardar los cambios');
            res.redirect('/Tienda');
        }
    });
};

exports.EliminarProducto = async (req, res, next) => {
    try {
        const Producto = await productos.findByIdAndDelete(req.params.id);
        
        if (!Producto) {
            req.flash('error', 'Producto no encontrado');
            return res.redirect('/Tienda');
        }

        req.flash('correcto', 'Producto eliminado exitosamente');
        res.redirect('/Tienda');
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        req.flash('error', 'Hubo un error al eliminar el producto');
        res.redirect('/Tienda');
    }
}

const passport = require('passport');
const Crypto = require('crypto');
const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario')

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/iniciar-sesion',
    failureFlash:true,
    badRequestMessage:'Ambos Campos son Obligatorios'
})

// Verificar Usuario
exports.usuarioAutenticado = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    // Sino  esta autenticado,redirigir a iniciar sesion
    return res.redirect('/iniciar-sesion');
}

// Cerrar Sesion
exports.cerrarSesion = (req,res,next) => {
    req.logout((function(err){
        if(err){
            return next(err);
        }
    }))
    req.flash('correcto','Cerraste sesion correctamente');
    res.redirect('/iniciar-sesion');
    next();
}


// Nuevo middleware para verificar si es admin
exports.esAdmin = (req, res, next) => {
    if(req.user && req.user.rol === 'admin') {
        return next();
    }
    
    req.flash('error', 'Acceso denegado. Solo administradores pueden realizar esta acción');
    res.redirect('/');
}
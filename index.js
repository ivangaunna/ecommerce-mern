const mongoose = require('mongoose');
require('./config/db');
const express = require('express'); 

const path = require('path');
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const session = require('express-session'); 
const passport = require('./config/passport')
const MongoStore = require('connect-mongo');
const flash = require('connect-flash')
const expressValidator = require('express-validator');
const methodOverride = require('method-override');


const app = express(); // Crear app express 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'))

app.use(expressValidator());// Validar Campos
app.use(methodOverride('_method'));
app.use(cookieParser()); // Crear Sesion
app.use(session({
    secret:'secreto',
    key:'password',
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({mongoUrl:'mongodb+srv://ivangaunna:AndreaVega1@tiendacluster.s0qzf.mongodb.net/TiendaVirtual'})
}))
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Middleware propio 
app.use ((req,res,next)=> {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    next();
});

app.set('view engine', 'pug');  
app.set('views',path.join(__dirname,'./views'));  
const routes = require('./routes') 
app.use('/', routes());   
app.listen(3000);
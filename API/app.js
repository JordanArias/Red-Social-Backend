'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors'); //cors para permitir peticiones desde el frontend
var app = express();

// cargar rutas

//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//cargar rutas
var user_routes = require('./routes/user.routes');
var follow_routes = require('./routes/follow.routes');
var publication_routes = require('./routes/publication.routes');
var message_routes = require('./routes/message.routes');

//cargar cors
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

app.get('/pruebas', (req, res) => {
    res.status(200).send({
        message: "Bienvenido al API REST de la Red Social"
    });
});

//exportar
module.exports = app;

'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar rutas

//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//cors

//rutas
app.get('/pruebas', (req, res) => {
    res.status(200).send({
        message: "Bienvenido al API REST de la Red Social"
    });
});

//exportar
module.exports = app;

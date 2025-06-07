'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar rutas

//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//cors

//cargar rutas
var user_routes = require('./routes/user.routes');
var follow_routes = require('./routes/follow.routes');
var publication_routes = require('./routes/publication.routes');
var message_routes = require('./routes/message.routes');

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

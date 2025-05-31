/**
 * Servidor Principal de la Red Social
 * =================================
 * 
 * Este archivo es el punto de entrada principal de la API REST de la Red Social.
 * Se encarga de:
 * - Conectar con la base de datos MongoDB
 * - Iniciar el servidor Express
 * - Configurar el entorno de ejecución
 * 
 * Componentes principales:
 * ----------------------
 * - Base de Datos: MongoDB corriendo en el puerto 27017
 * - Servidor API: Express.js corriendo en el puerto 3800
 * - Mongoose: Para trabajar con la base de datos de forma más sencilla
 * 
 * Cómo funciona:
 * -------------
 * 1. Primero intenta conectar con la base de datos MongoDB
 * 2. Si la conexión es exitosa, inicia el servidor web
 * 3. Si hay algún error, lo muestra en la consola
 */

'use strict'

var mongoose = require('mongoose');
var app = require('./API/app');
var port = process.env.PORT || 3800;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/red_social', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('*************** CONECTADO A LA BASE DE DATOS ***************');
        
        app.listen(port, () => {
            console.log('SERVIDOR CORRIENDO EN EL PUERTO http://localhost:' + port);
        });
    })
    .catch((err) => {
        console.log('*************** ERROR AL CONECTAR A LA BASE DE DATOS ***************');
        console.log(err);
    }); 
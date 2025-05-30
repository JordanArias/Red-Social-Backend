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

'use strict' // Activa modo estricto de JavaScript para mejor manejo de errores y seguridad

// ====================================
// IMPORTACIONES Y CONFIGURACIÓN BÁSICA
// ====================================

// Importamos mongoose para trabajar con la base de datos MongoDB
// Mongoose nos ayuda a trabajar con la base de datos usando objetos de JavaScript
var mongoose = require('mongoose');

// Importamos la configuración de Express donde están todas las rutas y configuraciones
var app = require('./app');

// Definimos el puerto donde correrá el servidor
// Si existe una variable de entorno PORT usa esa, sino usa el puerto 3800
var port = process.env.PORT || 3800;

// =========================
// CONFIGURACIÓN DE MONGOOSE
// =========================

// Configuramos mongoose para usar promesas
// Esto nos permite usar async/await o .then() cuando hacemos consultas a la base de datos
mongoose.Promise = global.Promise;

// ==============================
// CONEXIÓN A LA BASE DE DATOS
// ==============================

// Conectamos con la base de datos MongoDB
// useNewUrlParser: true -> Usa el nuevo sistema para procesar la URL de conexión
// useUnifiedTopology: true -> Usa el nuevo sistema para detectar y conectar con el servidor
mongoose.connect('mongodb://localhost:27017/red_social', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('*************** CONECTADO A LA BASE DE DATOS ***************');
        
        // Una vez conectados a la base de datos, iniciamos el servidor web
        // El servidor escuchará en el puerto configurado (3800 por defecto)
        app.listen(port, () => {
            console.log('SERVIDOR CORRIENDO EN EL PUERTO http://localhost:' + port);
        });
    })
    .catch((err) => {
        console.log('*************** ERROR AL CONECTAR A LA BASE DE DATOS ***************', err);
    });



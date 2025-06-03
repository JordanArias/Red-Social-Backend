'use strict'

// ====== IMPORTACIONES ======
// Express - Framework web que nos permite crear rutas y manejar peticiones HTTP
// Cuando hacemos require('express') obtenemos todas las funcionalidades del framework
var express = require('express');

// Importamos el controlador de usuarios que contiene las funciones que manejarán cada ruta
// Estas funciones procesan las peticiones y envían las respuestas
var UserController = require('../controllers/user.controller');

// Importamos el middleware de autenticación que creamos
// Este middleware verificará si el token JWT es válido antes de permitir el acceso a rutas protegidas
var md_auth = require('../middlewares/authenticated.middleware');

// Creamos un nuevo router de express
// El router nos permite agrupar rutas y sus manejadores en un solo objeto
var api = express.Router();

/*
 ====== DEFINICIÓN DE RUTAS ======
 Cada ruta se define con los siguientes componentes:
 1. Método HTTP (get, post, put, delete)
 2. Path o URL de la ruta
 3. Middlewares (opcional) - Funciones que se ejecutan antes del controlador
 4. Controlador - Función que maneja la lógica de negocio

 Formato: api.método('path', [middleware], controlador)
*/

// Ruta GET /home
// Uso: Hacer una petición GET a http://tudominio/api/home
// No requiere autenticación ni parámetros
// Sirve como endpoint de prueba para verificar que la API está funcionando
api.get('/home', UserController.home);

// Ruta GET /prueba
// Uso: Hacer una petición GET a http://tudominio/api/prueba
// Requiere: Token JWT válido en el header 'Authorization'
// El middleware md_auth.ensureAuth verificará el token antes de permitir el acceso
// Si el token es válido, ejecuta UserController.pruebas
// Si el token no es válido o no existe, retorna un error
api.get('/prueba', md_auth.ensureAuth, UserController.pruebas);

// Ruta POST /register
// Uso: Hacer una petición POST a http://tudominio/api/register
// Requiere: Datos del usuario en el body de la petición (nombre, email, contraseña, etc)
// No necesita autenticación porque es para usuarios nuevos
// La función saveUser del controlador procesará los datos y creará el usuario
api.post('/register', UserController.saveUser);

// Ruta POST /login
// Uso: Hacer una petición POST a http://tudominio/api/login
// Requiere: Email y contraseña en el body de la petición
// La función loginUser verificará las credenciales
// Si son correctas, genera y devuelve un token JWT
// Si son incorrectas, devuelve un error
api.post('/login', UserController.loginUser);

// Ruta GET /user/:id
// Uso: Hacer una petición GET a http://tudominio/api/user/:id
// Requiere: Token JWT válido en el header 'Authorization'
// El middleware md_auth.ensureAuth verificará el token antes de permitir el acceso
// Si el token es válido, ejecuta UserController.getUser
// Si el token no es válido o no existe, retorna un error
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);

// Ruta GET /users/:page
// Uso: Hacer una petición GET a http://tudominio/api/users/:page
// Requiere: Token JWT válido en el header 'Authorization'
// El middleware md_auth.ensureAuth verificará el token antes de permitir el acceso
// Si el token es válido, ejecuta UserController.getUsers
// Si el token no es válido o no existe, retorna un error
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);

// Ruta PUT /user/:id
// Uso: Hacer una petición PUT a http://tudominio/api/user/:id
// Requiere: Token JWT válido en el header 'Authorization'
// El middleware md_auth.ensureAuth verificará el token antes de permitir el acceso
// Si el token es válido, ejecuta UserController.updateUser
// Si el token no es válido o no existe, retorna un error
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);

// Ruta PUT /upload-image-user/:id
// Uso: Hacer una petición PUT a http://tudominio/api/upload-image-user/:id
// Requiere: Token JWT válido en el header 'Authorization'
// El middleware md_auth.ensureAuth verificará el token antes de permitir el acceso
// Si el token es válido, ejecuta UserController.uploadImage
// Si el token no es válido o no existe, retorna un error
api.post('/upload-image-user/:id', md_auth.ensureAuth, UserController.uploadImage);

// Exportamos el router para que pueda ser usado en app.js o index.js
// Esto permite que todas estas rutas sean accesibles bajo un prefijo común (ejemplo: /api)
module.exports = api;

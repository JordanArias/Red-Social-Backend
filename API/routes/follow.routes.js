'use strict'

// Importamos express
var express = require('express');
// Creamos un router para las rutas de seguimiento
var api = express.Router();
// Importamos el middleware de autenticación
var md_auth = require('../middlewares/authenticated.middleware');
// Importamos el controlador de seguimiento
var FollowController = require('../controllers/follow.controller');


/* 
---------------------------------------------------------
RUTAS DE FOLLOW
---------------------------------------------------------
*/

// RUTA PARA GUARDAR UN FOLLOW
api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);

// RUTA PARA ELIMINAR UN FOLLOW
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);



/*
---------------------------------------------------------
EXPORTAMOS EL ROUTER
---------------------------------------------------------
*/
module.exports = api; // Exportamos el router para que pueda ser usado en app.js o index.js


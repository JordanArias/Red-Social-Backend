'use strict';

// Importamos express
var express = require('express');
// Creamos un router para las rutas de seguimiento
var api = express.Router();
// Importamos el middleware de autenticación
var md_auth = require('../middlewares/authenticated.middleware');
// Importamos el controlador de seguimiento
var PublicationController = require('../controllers/publication.controller');

// Definimos las rutas de la publicación
api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);

// Exportamos el router
module.exports = api;





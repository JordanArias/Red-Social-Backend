'use strict';

// Importamos express
var express = require('express');
// Creamos un router para las rutas de seguimiento
var api = express.Router();
// Importamos el middleware de autenticación
var md_auth = require('../middlewares/authenticated.middleware');
// Importamos el controlador de mensajes    
var MessageController = require('../controllers/message.controller');

// Definimos las rutas
api.post('/save-message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/emmited-messages/:page?', md_auth.ensureAuth, MessageController.getEmmitedMessages);

// Exportamos el router
module.exports = api;
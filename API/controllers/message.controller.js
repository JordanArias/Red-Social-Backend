'use strict';

// Importamos las librerías necesarias
var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
var fs = require('fs');                // Para manejo de archivos
var path = require('path');            // Para manejo de rutas

// Importamos los modelos
var Message = require('../models/message');
var User = require('../models/user');
var Follow = require('../models/follow');



/*
***************************************************************************
* [SAVEMESSAGE] FUNCIÓN PARA GUARDAR UN MENSAJE
***************************************************************************
*/
async function saveMessage(req, res){
    try {
        var params = req.body;
        // Validamos que los datos no estén vacíos
        if(!params.text || !params.receiver){ // Si no hay texto o receptor, devolvemos un error
            res.status(400).send({message: 'Faltan datos'});
        }
        
        // Creamos el mensaje
        var message = new Message();
        message.emitter = req.user.sub; // ID del usuario emisor
        message.receiver = params.receiver; // ID del usuario receptor
        message.text = params.text; // Texto del mensaje
        message.viewed = 'N'; // Estado del mensaje (N = No leído, S = Leído)
        message.created_at = new Date(); // Fecha de creación del mensaje

        // Guardamos el mensaje
        const messageStored = await message.save();

        // Devolvemos el mensaje guardado
        if(!messageStored){
            return res.status(404).send({message: 'No se ha guardado el mensaje'});
        }

        // Devolvemos el mensaje guardado
        return res.status(200).send({message: 'Mensaje guardado correctamente'});

    } catch (error) {
        return res.status(500).send({message: 'Error al guardar el mensaje'});
    }
}


// Exportamos las funciones
module.exports = {
    saveMessage
}

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

/*
***************************************************************************
* [GETRECEIVEDMESSAGES] FUNCIÓN PARA OBTENER LOS MENSAJES RECIBIDOS
***************************************************************************
*/
async function getReceivedMessages(req, res){
    try {
        var userId = req.user.sub; // ID del usuario receptor
        var page = 1; // Página actual
        if(req.params.page){
            page = parseInt(req.params.page);
        }
        
        var itemsPerPage = 2; // Items por página
        if(req.params.itemsPerPage){
            itemsPerPage = parseInt(req.params.itemsPerPage);
        }

        // Buscamos los mensajes recibidos
        var messages = await Message.find({receiver: userId}) //Buscar donde el userId logueado es el receptor
        .populate('emitter', 'name surname image nick _id') // Populamos el campo emitter con el usuario emisor
        .sort({created_at: -1}) // Ordenamos los mensajes por fecha de creación de forma descendente
        .skip((page - 1) * itemsPerPage) // Saltamos los mensajes de las páginas anteriores
        .limit(itemsPerPage); // Limitamos el número de mensajes por página

        if(!messages){
            return res.status(404).send({message: 'No hay mensajes recibidos'});
        }

        // Devolvemos los mensajes recibidos
        return res.status(200).send({
            total: await Message.countDocuments({receiver: userId}), // Total de mensajes recibidos
            pages: Math.ceil(await Message.countDocuments({receiver: userId})/itemsPerPage), // Total de páginas
            page: page, // Página actual
            items_per_page: itemsPerPage, // Items por página
            messages // Mensajes recibidos
        });

    } catch (error) {
        return res.status(500).send({message: 'Error al obtener los mensajes recibidos'});
    }
}

/*
***************************************************************************
* [GETEMMITEDMESSAGES] FUNCIÓN PARA OBTENER LOS MENSAJES EMITIDOS
***************************************************************************
*/
async function getEmmitedMessages(req, res){
    try {
        var userId = req.user.sub; // ID del usuario emisor
        var page = 1; // Página actual
        if(req.params.page){
            page = parseInt(req.params.page);
        }

        var itemsPerPage = 2; // Items por página

        // Buscamos los mensajes emitidos
        var messages = await Message.find({emitter: userId}) //Buscar donde el userId logueado es el emisor
        .populate('emitter receiver', 'name surname image nick _id') // Populamos el campo receiver con el usuario receptor
        .sort({created_at: -1}) // Ordenamos los mensajes por fecha de creación de forma descendente
        .skip((page - 1) * itemsPerPage) // Saltamos los mensajes de las páginas anteriores
        .limit(itemsPerPage); // Limitamos el número de mensajes por página

        if(!messages){
            return res.status(404).send({message: 'No hay mensajes emitidos'});
        }

        // Devolvemos los mensajes emitidos
        return res.status(200).send({
            total: await Message.countDocuments({emitter: userId}), // Total de mensajes emitidos
            pages: Math.ceil(await Message.countDocuments({emitter: userId})/itemsPerPage), // Total de páginas
            page: page, // Página actual
            items_per_page: itemsPerPage, // Items por página
            messages // Mensajes emitidos
        });

    } catch (error) {
        return res.status(500).send({message: 'Error al obtener los mensajes emitidos'});
    }
}

// Exportamos las funciones
module.exports = {
    saveMessage,
    getReceivedMessages,
    getEmmitedMessages
}

'use strict'

// const path = require('path');
// const fs = require('fs');

// Importación de modelos
var User = require('../models/user'); // Importa el modelo de usuario
var Follow = require('../models/follow'); // Importa el modelo de seguimiento

/*
---------------------------------------------------------
- CONTROLADOR DE FOLLOW
---------------------------------------------------------
*/

/*
********************************************************************
* [SAVEFOLLOW] FUNCIÓN PARA GUARDAR UN FOLLOW
********************************************************************
*/
async function saveFollow(req, res){
    /*
     * Función para guardar una nueva relación de seguimiento entre usuarios
     * - Objeto request de Express que contiene los datos de la petición
     * - Objeto response de Express para enviar la respuesta
     * Respuesta con el estado y datos del follow guardado
    */
    try {
        // Obtiene los parámetros del cuerpo de la petición
        var params = req.body;

        // Crea una nueva instancia del modelo Follow
        var follow = new Follow();
        
        // Asigna el ID del usuario que está realizando la acción (el seguidor)
        follow.user = req.user.sub;
        
        // Asigna el ID del usuario que será seguido
        follow.followed = params.followed;

        // Intenta guardar el follow en la base de datos
        var followSaved = await follow.save();

        // Si no se pudo guardar, retorna un error 400 (Bad Request)
        if(!followSaved){
            return res.status(400).send({message: "Error al guardar el follow"});
        }

        // Si todo sale bien, retorna un status 200 y el follow guardado
        return res.status(200).send({follow: followSaved});

    } catch (error) {
        // Si ocurre algún error en el proceso, retorna un error 500 (Error interno del servidor)
        return res.status(500).send({
            message: "Error en la prueba de controlador de Follow",
            error: error.message
        });
    }
}

// Exportación de las funciones del controlador
module.exports = {
    saveFollow
}



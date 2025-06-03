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
     * - Parámetros:
     * - user: ID del usuario que está realizando la acción (el seguidor)
     * - followed: ID del usuario que será seguido
     * 
     * - Objeto request de Express que contiene los datos de la petición
     * - Objeto response de Express para enviar la respuesta
     * Respuesta con el estado y datos del follow guardado
    */
    try {
        // Obtiene los parámetros del cuerpo de la petición
        var params = req.body;

        // Verifica si ya existe un follow entre estos usuarios
        const existingFollow = await Follow.findOne({
            user: req.user.sub,
            followed: params.followed
        });

        if(existingFollow) {
            return res.status(400).send({
                message: "Ya estás siguiendo a este usuario"
            });
        }

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
        return res.status(200).send({message: "Follow guardado correctamente", follow: followSaved});

    } catch (error) {
        // Si ocurre algún error en el proceso, retorna un error 500 (Error interno del servidor)
        return res.status(500).send({
            message: "Error en la prueba de controlador de Follow",
            error: error.message
        });
    }
}

async function deleteFollow(req, res){
    //Función para eliminar una relación de seguimiento entre usuarios

    try {
        
        var userId = req.user.sub; 
        var followedId = req.params.id;

        // Busca el follow en la base de datos
        var follow = await Follow.findOne({user: userId, followed: followedId});

        // Si no se encuentra el follow, retorna un error 404 (Not Found)
        if(!follow){
            return res.status(404).send({message: "Error al eliminar el follow"});
        }

        // Elimina el follow de la base de datos
        await Follow.deleteOne({_id: follow._id});

        // Si todo sale bien, retorna un status 200 y un mensaje de éxito
        return res.status(200).send({message: "Follow eliminado correctamente"});

    } catch (error) {
        // Si ocurre algún error en el proceso, retorna un error 500 (Error interno del servidor)
        return res.status(500).send({
            message: "Error en la prueba de controlador de Follow",
            error: error.message
        });
    }
}

/*
 ********************************************************************
 * [EXPORT] EXPORTAMOS TODAS LAS FUNCIONES DEL CONTROLADOR
 ********************************************************************
 * para poder usarlas en las rutas de la aplicación
 */
module.exports = {
    saveFollow,
    deleteFollow
}



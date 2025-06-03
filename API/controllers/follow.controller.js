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
***************************************************************************
* [SAVEFOLLOW] FUNCIÓN PARA GUARDAR UN FOLLOW
***************************************************************************
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

/*
***************************************************************************
* [DELETEFOLLOW] FUNCIÓN PARA ELIMINAR UN FOLLOW
***************************************************************************
*/
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
***************************************************************************
* [GETFOLLOWINGUSERS] FUNCIÓN PARA OBTENER LOS USUARIOS QUE SIGUE UN USUARIO
***************************************************************************
* Esta función obtiene la lista de usuarios que sigue un usuario específico,
* con soporte para paginación y datos detallados de cada usuario seguido.
* 
* Parámetros URL opcionales:
* - id: ID del usuario del que queremos obtener sus seguidos
* - page: Número de página que queremos obtener
* - itemsPerPage: Cantidad de elementos por página
*
* Respuesta:
* - followingUsers: Array con los usuarios seguidos y sus datos
* - total: Número total de usuarios seguidos
* - pages: Número total de páginas
* - page: Página actual
* - items_per_page: Elementos por página
*/
async function getFollowingUsers(req, res){
    try {
        var userId = req.user.sub; // Obtiene el ID del usuario autenticado por defecto

        // Si se proporciona un ID en la URL, sobrescribe el ID del usuario autenticado
        // Esto permite ver los seguidos de cualquier usuario, no solo del autenticado
        // Si se proporciona un ID y una página, sobrescribe el ID del usuario autenticado y la página
        if(req.params.id && req.params.page){
            userId = req.params.id;
        }

        // Inicializa la página en 1 por defecto
        var page = 1;

        // Si se especifica una página en la URL, la convierte a número entero
        // parseInt asegura que el valor sea un número y no un string
        if(req.params.page){
            page = parseInt(req.params.page); 
        }

        // Define el número de elementos por página (4 por defecto)
        var itemsPerPage = 1;

        // Si se especifica una cantidad de elementos por página en la URL, la convierte a número
        if(req.params.itemsPerPage){
            itemsPerPage = parseInt(req.params.itemsPerPage);
        }

        // Cuenta el número total de usuarios que sigue
        // countDocuments() es un método de Mongoose que cuenta documentos que coinciden con el criterio
        const total = await Follow.countDocuments({user: userId});

        // Verifica si el usuario no sigue a nadie
        if(total === 0) {
            return res.status(404).send({
                message: "El usuario no está siguiendo a ninguna persona",
                total: 0,
                pages: 0,
                page: 1,
                items_per_page: itemsPerPage
            });
        }
        
        // Busca los usuarios seguidos con las siguientes operaciones:
        const followingUsers = await Follow.find({user: userId})  // Busca todos los follows donde el usuario es el seguidor
            .populate('followed', 'name surname image nick email')  // Rellena los datos del usuario seguido (solo los campos especificados)
            .skip((page - 1) * itemsPerPage)  // Salta los documentos de páginas anteriores
            .limit(itemsPerPage);  // Limita el número de resultados por página

        // Envía la respuesta con todos los datos necesarios para la paginación
        return res.status(200).send({
            followingUsers,        // Lista de usuarios seguidos
            total,                 // Número total de follows
            pages: Math.ceil(total/itemsPerPage),  // Calcula el número total de páginas redondeando hacia arriba
            page: page,            // Página actual
            items_per_page: itemsPerPage  // Elementos por página configurados
        });
    } catch (error) {
        // Si ocurre algún error, envía un mensaje de error con los detalles
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
    deleteFollow,
    getFollowingUsers
}



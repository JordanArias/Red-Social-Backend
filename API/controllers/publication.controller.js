'use strict';

var path = require('path');
var fs = require('fs');
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

/*
 ********************************************************************
 * [SAVEPUBLICATION] FUNCION PARA GUARDAR UNA PUBLICACION
 ********************************************************************
*/
async function savePublication(req, res){
    try{
        var params = req.body;

        if(!params.text){
            return res.status(200).send({status: 'error',message: 'La publicación no tiene texto'});
        }
    
        var publication = new Publication();
        publication.text = params.text;
        publication.file = null;
        publication.created_at = new Date();
        publication.user = req.user.sub;

        const publicationStored = await publication.save();

        if(!publicationStored){
            return res.status(400).send({status: 'error',message: 'Error al guardar la publicación'});
        }

        return res.status(200).send({status: 'success',message: 'Publicación creada correctamente',publication: publicationStored});
    
    }catch(err){
        return res.status(500).send({status: 'error',message: 'Error al guardar la publicación'});
    }
}

/*
 ********************************************************************
 * [GETPUBLICATIONS] FUNCION PARA OBTENER LAS PUBLICACIONES
 ********************************************************************
*/
async function getPublications(req, res) {
    // Definimos la función como asíncrona para poder usar 'await' en las consultas a la base de datos.
    try {
        // Inicializamos la variable 'page' para la paginación, comenzando en la página 1.
        var page = 1; 
        // Inicializamos 'itemsPerPage' para definir cuántas publicaciones se mostrarán por página.
        var itemsPerPage = 2; 

        // Verificamos si se ha pasado un número de página en los parámetros de la solicitud.
        if (req.params.page) {
            // Si existe, convertimos el valor a un entero y lo asignamos a 'page'.
            page = parseInt(req.params.page);
        }

        // PRIMERO::: BUSCAMOS LOS USUARIOS QUE SEGUIMOS
        // Realizamos una consulta para encontrar todos los usuarios que el usuario actual sigue.
        const follows = await Follow.find({ user: req.user.sub }).populate('followed');

        // Si no se encuentran seguidores, respondemos con un error 400.
        if (!follows) {
            return res.status(400).send({ status: 'error', message: 'No hay publicaciones' });
        }

        // Creamos un array vacío para almacenar los IDs de los usuarios seguidos.
        var follow_clean = [];
        // Iteramos sobre el array de 'follows' para extraer solo los IDs de los usuarios que seguimos.
        follows.forEach(follow => {
            follow_clean.push(follow.followed); // Agregamos cada ID de usuario seguido al array 'follow_clean'.
        });

        // SEGUNDO::: BUSCAMOS LAS PUBLICACIONES DE LOS USUARIOS QUE SEGUIMOS
        // Realizamos una consulta para encontrar las publicaciones de los usuarios que seguimos.
        const publications = await Publication.find({ user: { $in: follow_clean } })
            .sort({ created_at: -1 }) // Ordenamos las publicaciones por fecha de creación de forma descendente.
            .skip((page - 1) * itemsPerPage) // Saltamos las publicaciones que ya hemos mostrado en páginas anteriores.
            .limit(itemsPerPage) // Limitamos el número de publicaciones que se mostrarán en esta página.
            .populate('user') // Incluimos la información completa del usuario que hizo la publicación.
            .exec(); // Ejecutamos la consulta.

        // Si no se encuentran publicaciones, respondemos con un error 400.
        if (!publications) {
            return res.status(400).send({ status: 'error', message: 'No hay publicaciones' });
        }

        // Respondemos con un estado 200 y enviamos la información de las publicaciones.
        return res.status(200).send({
            total_items: publications.length, // 'total_items' contiene el número total de publicaciones en la respuesta. 
            pages: Math.ceil(publications.length / itemsPerPage), // 'pages' calcula el total de páginas basándose en el número de publicaciones y los elementos por página.
            page: page, // 'page' indica la página actual solicitada.
            publications: publications // 'publications' contiene las publicaciones obtenidas de la base de datos.
        });

    } catch (err) {
        // Si ocurre un error en cualquier parte del bloque try, se captura aquí.
        console.log(err); // Registramos el error en la consola para depuración.
        // Respondemos con un estado 500 y un mensaje de error.
        return res.status(500).send({ status: 'error', message: 'Error al obtener las publicaciones' });
    }
}

async function getPublication(req, res){
    try{
        var publication_id = req.params.id;
        const publication = await Publication.findById(publication_id);

        if(!publication){
            return res.status(400).send({status: 'error',message: 'No se ha encontrado la publicación'});
        }

        return res.status(200).send({status: 'success',publication: publication});

    }catch(err){
        console.log(err);
        return res.status(500).send({status: 'error',message: 'Error al obtener las publicaciones'});
    }
}

module.exports = {
    savePublication,
    getPublications,
    getPublication
}





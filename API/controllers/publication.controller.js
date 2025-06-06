'use strict';

var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
var fs = require('fs');                // Para manejo de archivos
var path = require('path');            // Para manejo de rutas
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

/*
 ********************************************************************
 * [GETPUBLICATION] FUNCION PARA OBTENER UNA PUBLICACION
 ********************************************************************
*/
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

/*
 ********************************************************************
 * [DELETEPUBLICATION] FUNCION PARA ELIMINAR UNA PUBLICACION
 ********************************************************************
*/
async function deletePublication(req, res) {
    try {
        // Obtenemos el ID de la publicación desde los parámetros de la solicitud
        const publicationId = req.params.id;
        // Obtenemos el ID del usuario que realiza la solicitud
        const userId = req.user.sub;

        // Buscamos la publicación por su ID
        const publication = await Publication.findById(publicationId);

        // Verificamos si la publicación existe
        if (!publication) {
            return res.status(404).send({ status: 'error', message: 'Publicación no encontrada' });
        }

        // Verificamos si el ID del usuario que realiza la solicitud coincide con el ID del usuario que creó la publicación
        if (publication.user.toString() !== userId) {
            return res.status(403).send({ status: 'error', message: 'No tienes permiso para eliminar esta publicación' });
        }

        // Si las verificaciones son exitosas, procedemos a eliminar la publicación
        await Publication.findByIdAndDelete(publicationId);

        // Respondemos con un mensaje de éxito
        return res.status(200).send({ status: 'success', message: 'Publicación eliminada correctamente'});

    } catch (err) {
        // Si ocurre un error, lo registramos y respondemos con un error
        console.log(err);
        return res.status(500).send({ status: 'error', message: 'Error al eliminar la publicación' });
    }
}

/*
 ********************************************************************
 * [UPLOADIMAGEFILE] FUNCIÓN PARA SUBIR IMAGEN DE PERFIL DE USUARIO
 ********************************************************************
*/
async function uploadImageFile(req, res){

     try{
         // 1. VALIDACIÓN DE PERMISOS
         // Extraemos el ID de la publicación de los parámetros de la URL
         const publicationId = req.params.imageFile;
 
        // Verificamos que el usuario autenticado sea el mismo que quiere actualizar su imagen
        // req.user.sub viene del middleware de autenticación
        if(publicationId != req.user.sub){
            return res.status(403).send({
                message: "No tienes permisos para actualizar esta publicación"
            });
        }

         // 2. CONFIGURACIÓN DE FORMIDABLE
         // Creamos una nueva instancia de formidable para procesar la subida de archivos
         const form = new formidable.IncomingForm({
             uploadDir: './uploads/publications',    // Directorio donde se guardarán las imágenes
             keepExtensions: true,            // Mantiene la extensión original del archivo (.jpg, .png, etc)
             maxFileSize: 5 * 1024 * 1024,    // Tamaño máximo: 5MB (5 * 1024 * 1024 bytes)
             filter: ({name, originalFilename, mimetype}) => {
                 // Función de filtrado: solo permite archivos que sean imágenes
                 // mimetype ejemplo: 'image/jpeg', 'image/png'
                 return mimetype && mimetype.includes("image");
             }
         });
 
         // 3. PROCESAMIENTO DEL ARCHIVO(image) SUBIDO PIR EL USUARIO
         // form.parse devuelve una promesa con [campos, archivos]
         // fields: campos normales del formulario (no usados aquí)
         // files: contiene los archivos subidos
         const [fields, files] = await form.parse(req);
 
         console.log("ID de publicación:", publicationId);
         console.log("Archivos recibidos:", files);
 
         // Verificamos si se subió alguna imagen en el campo 'image'
         if(!files.image || files.image.length === 0){
             return res.status(400).send({
                 message: "No se ha subido ninguna imagen"
             });
         }
 
         // 4. VALIDACIÓN DEL ARCHIVO
         // Extraemos la información del archivo subido
         const file = files.image[0];              // Tomamos el primer archivo del campo 'image'
         const filePath = file.filepath;           // Ruta temporal donde formidable guardó el archivo
         const fileExt = path.extname(file.originalFilename).toLowerCase();  // Extraemos la extensión del archivo
 
         // Lista de extensiones permitidas
         const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
         
         // Validamos que la extensión sea permitida
         if(!validExtensions.includes(fileExt)){
             // Si la extensión no es válida:
             fs.unlinkSync(filePath);              // 1. Eliminamos el archivo temporal
             return res.status(400).send({         // 2. Devolvemos error
                 message: "Extensión no válida. Solo se permiten: " + validExtensions.join(', ')
             });
         }
 
         // 5. GUARDADO DEL ARCHIVO
         // Generamos un nombre único para el archivo
         // Formato: idUsuario-timestamp.extension (ejemplo: 123-1634567890.jpg)
         const finalFileName = `${publicationId}-${Date.now()}${fileExt}`;
         const finalPath = path.join('./uploads/publications', finalFileName); // Ruta final donde se guardará el archivo
         
         // Movemos el archivo de la ubicación temporal a la final
         fs.renameSync(filePath, finalPath);
 
         // 6. ACTUALIZACIÓN EN BASE DE DATOS
         // Actualizamos el campo 'image' del usuario en MongoDB
         const publicationUpdated = await Publication.findByIdAndUpdate(
             publicationId,                     // ID del usuario a actualizar
             { file: finalFileName },   // Nuevo valor para el campo 'image'
             { new: true }              // Opción para devolver el documento actualizado
         );
 
         // Verificamos si se actualizó correctamente
         if(!publicationUpdated){
             return res.status(404).send({
                 message: "No se ha podido actualizar la imagen de la publicación"
             });
         }
 
         // 7. RESPUESTA EXITOSA
         // Si todo salió bien, devolvemos la respuesta con los datos actualizados
         return res.status(200).send({
             message: "Imagen subida correctamente",
             publication: publicationUpdated,
             file: finalFileName
         });
 
     }catch(err){
         // 8. MANEJO DE ERRORES
         // Error específico: archivo demasiado grande
         if(err.message.includes('maxFileSize')){
             return res.status(400).send({
                 message: "El archivo es demasiado grande. Máximo 5MB"
             });
         }
 
         // Cualquier otro error
         return res.status(500).send({
             message: "Error al subir la imagen",
             error: err.message
         });
     }
 }


module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImageFile
}





/**
 * Modelo de Publicación para la Red Social
 * ======================================
 * 
 * Este archivo define la estructura de datos para las publicaciones en la base de datos MongoDB.
 * Cada publicación en la red social tendrá estos campos definidos que almacenarán su información.
 */

'use strict'

const { text } = require('body-parser');
// Importamos el módulo 'mongoose' que nos permite trabajar con MongoDB
// mongoose es una biblioteca que nos facilita trabajar con MongoDB usando JavaScript
var mongoose = require('mongoose');

// Schema es una clase de mongoose que usamos para definir la estructura de los documentos
// Es como un plano que dice qué datos y de qué tipo puede tener cada publicación
var Schema = mongoose.Schema;

/**
 * Esquema de Publication
 * --------------------
 * El campo user es especial porque crea una relación con el modelo User:
 * - type: Schema.ObjectId -> Indica que guardará el ID de un documento de MongoDB
 * - ref: 'User' -> Hace referencia al modelo User que creamos antes
 * 
 * Esto nos permite:
 * 1. Guardar qué usuario creó cada publicación
 * 2. Hacer populate() más tarde para obtener todos los datos del usuario
 * 3. Mantener la integridad referencial entre publicaciones y usuarios
 */
var PublicationSchema = Schema({
    text: String,        // Texto de la publicación
    file: String,        // Archivo adjunto (imagen, video, etc)
    created_at: Date,  // Fecha de creación
    user: { 
        type: Schema.ObjectId,  // Tipo especial para IDs de MongoDB
        ref: 'User'            // Referencia al modelo User
    }
});

// mongoose.model() crea un modelo usando el esquema que definimos
// - Primer parámetro 'Publication': nombre del modelo (MongoDB creará una colección llamada 'publications')
// - Segundo parámetro PublicationSchema: el esquema que usará este modelo
// Este modelo nos permitirá hacer operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en la base de datos
module.exports = mongoose.model('Publication', PublicationSchema);
/**
 * Modelo de Follow (Seguimiento) para la Red Social
 * ==============================================
 * 
 * Este modelo maneja las relaciones de "seguir" entre usuarios.
 * Cada documento Follow representa que un usuario sigue a otro:
 * - user: El usuario que sigue (seguidor)
 * - followed: El usuario que es seguido
 */

'use strict'

const { text } = require('body-parser');
// Importamos el módulo 'mongoose' que nos permite trabajar con MongoDB
// mongoose es una biblioteca que nos facilita trabajar con MongoDB usando JavaScript
var mongoose = require('mongoose');

// Schema es una clase de mongoose que usamos para definir la estructura de los documentos
// Es como un plano que dice qué datos y de qué tipo puede tener cada usuario
var Schema = mongoose.Schema;

/**
 * Esquema de Follow (Seguimiento)
 * -----------------------------
 * Este esquema tiene dos campos, ambos son referencias a usuarios:
 * 
 * 1. user: El usuario que realiza la acción de seguir
 *    - Schema.ObjectId: Guarda el ID del usuario seguidor
 *    - ref: 'User': Conecta con el modelo User
 * 
 * 2. followed: El usuario que es seguido
 *    - Schema.ObjectId: Guarda el ID del usuario seguido
 *    - ref: 'User': Conecta con el modelo User
 * 
 * Ejemplo de uso:
 * {
 *    user: "ID_del_usuario_que_sigue",
 *    followed: "ID_del_usuario_seguido"
 * }
 */
var FollowSchema = Schema({
    user: { 
        type: Schema.ObjectId,    // ID del usuario que sigue
        ref: 'User'              // Referencia al modelo User
    },
    followed: { 
        type: Schema.ObjectId,    // ID del usuario seguido
        ref: 'User'              // Referencia al modelo User
    }
});

// mongoose.model() crea un modelo usando el esquema que definimos
// - Primer parámetro 'Follow': nombre del modelo (MongoDB creará una colección llamada 'follows')
// - Segundo parámetro FollowSchema: el esquema que usará este modelo
// Este modelo nos permitirá hacer operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en la base de datos
module.exports = mongoose.model('Follow', FollowSchema);
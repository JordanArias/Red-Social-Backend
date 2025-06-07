/**
 * Modelo de Message (Mensaje) para la Red Social
 * ==============================================
 * 
 * Este modelo maneja los mensajes entre usuarios de la red social.
 * Cada documento Message representa un mensaje enviado de un usuario a otro:
 * - text: El contenido del mensaje
 * - created_at: La fecha y hora de creación del mensaje
 * - emitter: El usuario que envía el mensaje
 * - receiver: El usuario que recibe el mensaje
 */

'use strict'

const { text } = require('body-parser');
// Importamos el módulo 'mongoose' que nos permite trabajar con MongoDB
// mongoose es una biblioteca que nos facilita trabajar con MongoDB usando JavaScript
var mongoose = require('mongoose');

// Schema es una clase de mongoose que usamos para definir la estructura de los documentos
// Es como un plano que dice qué datos y de qué tipo puede tener cada mensaje
var Schema = mongoose.Schema;

/**
 * Esquema de Message (Mensaje)
 * ---------------------------
 * Este esquema tiene cuatro campos que definen la estructura de un mensaje:
 * 
 * 1. text: El contenido del mensaje
 *    - String: Almacena el texto del mensaje
 * 
 * 2. created_at: La fecha de creación
 *    - String: Almacena la fecha y hora cuando se creó el mensaje
 * 
 * 3. emitter: El usuario que envía el mensaje
 *    - Schema.ObjectId: Guarda el ID del usuario emisor
 *    - ref: 'User': Conecta con el modelo User
 * 
 * 4. receiver: El usuario que recibe el mensaje
 *    - Schema.ObjectId: Guarda el ID del usuario receptor
 *    - ref: 'User': Conecta con el modelo User
 * 
 * Ejemplo de uso:
 * {
 *    text: "¡Hola! ¿Cómo estás?",
 *    created_at: "2024-03-21T15:30:00",
 *    emitter: "ID_del_usuario_que_envia",
 *    receiver: "ID_del_usuario_que_recibe"
 * }
 */
var MessageSchema = Schema({
    text: String,
    viewed: String,
    created_at: String,
    emitter: { 
        type: Schema.ObjectId,    // ID del usuario que envía
        ref: 'User'              // Referencia al modelo User
    },
    receiver: { 
        type: Schema.ObjectId,    // ID del usuario receptor
        ref: 'User'              // Referencia al modelo User
    }
});

// mongoose.model() crea un modelo usando el esquema que definimos
// - Primer parámetro 'Message': nombre del modelo (MongoDB creará una colección llamada 'messages')
// - Segundo parámetro MessageSchema: el esquema que usará este modelo
// Este modelo nos permitirá hacer operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en la base de datos
module.exports = mongoose.model('Message', MessageSchema);
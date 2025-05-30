/**
 * Modelo de Usuario para la Red Social
 * ==================================
 * 
 * Este archivo define la estructura de datos para los usuarios en la base de datos MongoDB.
 * Cada usuario en la red social tendrá estos campos definidos que almacenarán su información personal.
 */

'use strict'

// Importamos el módulo 'mongoose' que nos permite trabajar con MongoDB
// mongoose es una biblioteca que nos facilita trabajar con MongoDB usando JavaScript
var mongoose = require('mongoose');

// Schema es una clase de mongoose que usamos para definir la estructura de los documentos
// Es como un plano que dice qué datos y de qué tipo puede tener cada usuario
var Schema = mongoose.Schema;

/*** Esquema de Usuario
    * -----------------*/
var UserSchema = Schema({
    name: String,        // Nombre del usuario
    surname: String,     // Apellidos del usuario
    nickname: String,    // Nombre único en la plataforma
    email: String,       // Correo electrónico
    password: String,    // Contraseña (se debe encriptar)
    role: String,        // Rol del usuario
    image: String        // Imagen de perfil
});

// mongoose.model() crea un modelo usando el esquema que definimos
// - Primer parámetro 'User': nombre del modelo (MongoDB creará una colección llamada 'users')
// - Segundo parámetro UserSchema: el esquema que usará este modelo
// Este modelo nos permitirá hacer operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en la base de datos
module.exports = mongoose.model('User', UserSchema);
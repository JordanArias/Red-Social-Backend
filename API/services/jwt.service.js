/*
 * Servicio JWT (JSON Web Token)
 * Este servicio se encarga de generar tokens de autenticación para los usuarios.
 * Un JWT es una forma segura de transmitir información entre partes como un objeto JSON.
 * 
 * ¿Por qué guardamos datos del usuario en el token?
 * 1. Evita consultas innecesarias a la base de datos: Al tener los datos básicos
 *    del usuario en el token, no necesitamos consultar la base de datos cada vez
 *    que necesitemos información como el nombre o rol del usuario
 * 2. Mejora el rendimiento: Al reducir consultas a la base de datos, la aplicación
 *    responde más rápido
 * 3. Facilita la autorización: Con el rol del usuario en el token, podemos
 *    verificar rápidamente si tiene permiso para acceder a ciertas funciones
 * 4. Mantiene la sesión: El token sirve como prueba de que el usuario está
 *    autenticado y contiene toda la información necesaria de su sesión
 */
'use strict'

// Importamos las librerías necesarias
const jwt = require('jwt-simple');        // Librería para crear y decodificar tokens JWT
const moment = require('moment');         // Librería para manejar fechas y tiempos
const secret = 'clave_secreta_para_generar_el_token';  // Clave secreta para firmar el token

/**
 * Función para crear un token JWT
 * @param {Object} user - Objeto con los datos del usuario
 * @returns {String} Token JWT codificado
 */
exports.createToken = function(user){
    // Creamos el payload (datos que queremos guardar en el token)
    const payload = {
        // Datos de identificación
        sub: user._id,          // ID único del usuario - necesario para operaciones en BD
        name: user.name,        // Nombre - útil para mostrar en la interfaz sin consultar BD
        surname: user.surname,  // Apellido - útil para mostrar en la interfaz sin consultar BD
        nick: user.nick,        // Nickname - útil para menciones y búsquedas rápidas
        email: user.email,      // Email - útil para operaciones que requieran el correo
        role: user.role,        // Rol - necesario para verificar permisos rápidamente
        image: user.image,      // URL imagen - útil para mostrar avatar sin consultar BD

        // Datos de seguridad y tiempo
        iat: moment().unix(),   // Fecha de creación - para control de seguridad
        exp: moment().add(30, 'days').unix()  // Fecha de expiración - para forzar re-login
    };

    // Codificamos el payload usando la clave secreta y lo devolvemos
    return jwt.encode(payload, secret);  // Usamos la constante secret definida arriba
}
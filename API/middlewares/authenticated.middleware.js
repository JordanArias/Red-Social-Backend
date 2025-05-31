// Modo estricto de JavaScript para mejor manejo de errores y optimización
'use strict'

// Importación de módulos necesarios
const jwt = require('jwt-simple'); // Librería para manejar JSON Web Tokens (codificación y decodificación)
const moment = require('moment');   // Librería para manejar fechas y tiempos de manera sencilla
const secret = 'clave_secreta_para_generar_el_token'; // Clave secreta única para firmar y verificar los tokens

/*
 Este middleware de autenticación verifica que las peticiones a rutas protegidas contengan
 un token JWT válido en el header de autorización. El token contiene la información del usuario
 y su tiempo de expiración. Si el token es válido, se extrae la información del usuario y se 
 añade al objeto request para que esté disponible en las siguientes funciones. Si el token
 no es válido o ha expirado, se devuelve un error y se detiene la petición.
*/
exports.ensureAuth = function(req, res, next){
    // Verifica si existe el header de autorización en la petición HTTP
    // El token debe venir en el header 'Authorization'
    if(!req.headers.authorization){
        // Si no existe el header, significa que el cliente no envió el token
        // Se retorna un error 403 (Forbidden) - No tiene permiso para acceder
        return res.status(403).send({message: "La petición no tiene la cabecera de autenticación"});
    }

    // Limpia el token eliminando las comillas simples o dobles que pueda contener
    // Esto es necesario porque algunos clientes pueden enviar el token entre comillas
    const token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        // Intenta decodificar el token usando la clave secreta
        // Si el token es válido, jwt.decode retornará el payload con los datos del usuario
        var payload = jwt.decode(token, secret);

        // Verifica si el token ha expirado comparando la fecha de expiración
        // moment().unix() obtiene la fecha actual en formato timestamp
        if(payload.exp <= moment().unix()){
            // Si el token ha expirado, retorna un error 401 (Unauthorized)
            // El cliente deberá obtener un nuevo token
            return res.status(401).send({
                message: "El token ha expirado"
            });
        }
    }catch(ex){
        // Si hay un error al decodificar el token significa que es inválido
        // Esto puede ocurrir si el token fue manipulado o si la firma no coincide
        return res.status(404).send({
            message: "El token no es válido",
            error: ex
        });
    }

    // Si llegamos aquí, el token es válido y no ha expirado
    // Guardamos los datos del usuario (payload) en el objeto request
    // para que esté disponible en los siguientes middlewares o controladores
    req.user = payload;
    
    // Continúa con la siguiente función en la cadena de middleware
    next();
}






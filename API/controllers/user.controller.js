/*
 * Controlador de Usuarios - Maneja el registro y gestión de usuarios
 */
'use strict'

var bcrypt = require('bcrypt');        // Librería para convertir contraseña en texto cifrado
var User = require('../models/user');  // Importa el esquema de usuario de MongoDB

/*
 * Función para la página principal
 * Cuando alguien accede a la ruta principal, devuelve un mensaje de bienvenida
 * para confirmar que la API está funcionando
 */
function home(req, res) {
    res.status(200).send({            // Devuelve código 200 = todo OK
        message: "HOME Bienvenido al API REST de la Red Social"
    });
}

/*
 * Función de prueba
 * Esta ruta sirve para verificar que la API está respondiendo correctamente
 * y que las rutas están bien configuradas
 */
function test(req, res) {
    res.status(200).send({            // Devuelve código 200 = todo OK
        message: "TEST Bienvenido al API REST de la Red Social"
    });
}

/*
 ***********************************************************
 * [SAVEUSER] FUNCION PARA REGISTRAR NUEVOS USUARIOS EN LA RED SOCIAL
 ***********************************************************
 * Códigos de estado que puede devolver:
 * - 200: Todo OK, usuario creado
 * - 400: Error en los datos (campos faltantes o email inválido)
 * - 404: No se pudo registrar el usuario
 * - 500: Error del servidor
 */
async function saveUser(req, res){     // async = función que puede esperar por operaciones
    try {                             // try-catch = maneja errores si algo falla
        var user = new User();        // Crea objeto vacío usando el modelo de usuario
        var params = req.body;        // Extrae datos enviados en el POST (nombre, email, etc)

        if(params.name && params.surname && 
           params.nick && params.email && params.password){    // Revisa si llegaron todos los datos

            // Verificamos si ya existe un usuario con el mismo email o nick
            // usando findOne de MongoDB que busca un solo documento que coincida
            const existingUser = await User.findOne({ 
                $or: [                                    // $or permite buscar por email O nick
                    {email: params.email.toLowerCase()},  // Busca email convertido a minúsculas
                    {nick: params.nick.toLowerCase()}     // Busca nick convertido a minúsculas
                ]
            });

            // Si encontramos un usuario existente, detenemos el registro
            // y enviamos mensaje de que ya existe
            if(existingUser){
                return res.status(200).send({
                    message: "El usuario que intenta registrar ya existe"
                });
            }

            // Si no existe, continuamos con el registro
            user.name = params.name;                      // Guarda nombre que llegó en el POST
            user.surname = params.surname;                // Guarda apellido que llegó en el POST
            user.nick = params.nick.toLowerCase();        // Guarda nick en minúsculas
            user.email = params.email.toLowerCase();      // Guarda email en minúsculas
            user.role = "ROLE_USER";                     // Asigna rol básico de usuario
            user.image = null;                           // Al inicio no tiene foto de perfil

            const hash = await bcrypt.hash(params.password, 10);    // Convierte contraseña en texto cifrado
            user.password = hash;                                   // Guarda la contraseña cifrada

            const userStored = await user.save();        // Guarda todos los datos en MongoDB
            
            if(userStored){                             // Si se guardó bien
                res.status(200).send({user: userStored}); // Devuelve los datos del usuario creado
            }else{                                      // Si no se pudo guardar
                res.status(404).send({                  // Devuelve error 404 = no se encontró
                    message: "No se ha registrado el usuario"
                });
            }
        }else{                                         // Si faltan datos requeridos
            res.status(400).send({                     // Devuelve error 400 = petición incorrecta
                message: "Todos los campos son obligatorios"
            });
        }
    } catch(err) {                                    // Si ocurre cualquier error
        res.status(500).send({                        // Devuelve error 500 = error del servidor
            message: "Error al guardar el usuario",
            error: err.message                        // Incluye el mensaje de error específico
        });
    }
}

/*
 * Exportamos todas las funciones del controlador
 * para poder usarlas en las rutas de la aplicación
 */
module.exports = {                    // Exporta las funciones para que otros archivos las usen
    home,
    test,
    saveUser
};
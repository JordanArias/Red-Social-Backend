/*
 * Controlador de Usuarios - Maneja el registro y gestión de usuarios
 */
'use strict'

/*
 * Códigos de estado que puede devolver:
 * - 200: Todo OK, usuario creado
 * - 400: Error en los datos (campos faltantes o email inválido)
 * - 404: No se pudo registrar el usuario
 * - 500: Error del servidor
 */

// Importamos las librerías necesarias
var bcrypt = require('bcrypt');        // Librería para convertir contraseña en texto cifrado
var User = require('../models/user');  // Importa el esquema de usuario de MongoDB
var jwt = require('../services/jwt.service'); // Importa el servicio JWT

/* 
********************************************************************
* [HOME] METODOS DE PRUEBA
********************************************************************
*/ 
function home(req, res) {
    res.status(200).send({            // Devuelve código 200 = todo OK
        message: "HOME Bienvenido al API REST de la Red Social"
    });
}

/* 
********************************************************************
* [PRUEBAS] METODOS DE PRUEBA
********************************************************************
*/ 
function pruebas(req, res) {
    res.status(200).send({            // Devuelve código 200 = todo OK
        message: "TEST Bienvenido al API REST de la Red Social"
    });
}

/*
 ********************************************************************
 * [SAVEUSER] FUNCION PARA REGISTRAR NUEVOS USUARIOS EN LA RED SOCIAL
 ********************************************************************
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
 ********************************************************************
 * [LOGINUSER] FUNCION PARA INICIAR SESION EN LA RED SOCIAL
 ********************************************************************
*/
async function loginUser(req, res){
    try{
        const params = req.body;
        const email = params.email;
        const password = params.password;

        // Verificamos si ya existe un usuario con el mismo email
        // usando findOne de MongoDB que busca un solo documento que coincida
        const user = await User.findOne({email: params.email});

        // Si existe el usuario, continuamos con la verificación de la contraseña
        if(user){
            // Comparamos la contraseña ingresada con la contraseña cifrada     
            bcrypt.compare(password, user.password, (err, check) => {
                // Si la contraseña coincide, generamos un token
                if(check){
                    // Si el usuario quiere un token, generamos uno
                    if(params.gettoken){
                        // Generamos un token para el usuario
                        return res.status(200).send({
                            // Devolvemos el token
                            token: jwt.createToken(user)
                        });

                    }else{
                        // Si la contraseña coincide, devolvemos un mensaje de éxito
                        user.password = undefined;
                        return res.status(200).send({message: "Login correcto",user: user});
                    }                  
                }else{
                    // Si la contraseña no coincide, devolvemos un mensaje de error
                    return res.status(404).send({message: "El usuario no se ha podido identificar"});
                }
            });
        }else{
            // Si no existe el usuario, devolvemos un mensaje de error
            return res.status(404).send({message: "El usuario no se ha podido identificar!!"});
        }
        
    } catch(err) {
        return res.status(500).send({message: "Error al iniciar sesión",error: err.message});
    }
}

/*
 ********************************************************************
 * [GETUSER] FUNCION PARA OBTENER UN USUARIO POR SU ID
 ********************************************************************
*/
async function getUser(req, res){
    try{
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).send({message: "El usuario no se ha podido identificar"});
        }
        return res.status(200).send({user: user});
    }catch(err){
        return res.status(500).send({message: "Error al obtener el usuario",error: err.message});
    }
}

/*
 ********************************************************************
 * [GETUSERS] FUNCION PARA OBTENER TODOS LOS USUARIOS
 ********************************************************************
*/
async function getUsers(req, res){
    try{
        // Extraemos el ID del usuario que está haciendo la petición
        // Este valor viene del middleware de autenticación (req.user.sub)
        const identity = req.user.sub;

        // Configuramos la página que queremos ver
        // Por defecto será la página 1 si no se especifica otra
        var page = 1;
        
        // Si en la URL viene un parámetro 'page', lo usamos
        // Ejemplo: /api/users/2 <- mostraría la página 2
        if(req.params.page){
            // Convertimos el parámetro a número ya que viene como string
            page = parseInt(req.params.page);
        }

        // Definimos cuántos usuarios queremos mostrar por página
        // En este caso, 2 usuarios por página
        var itemsPerPage = 2;

        // Consultamos a MongoDB cuántos usuarios hay en total
        // countDocuments() cuenta todos los documentos en la colección User
        const total = await User.countDocuments();
        
        // Calculamos cuántos documentos debemos saltar según la página
        // Ejemplo: 
        // - Página 1: skip = (1-1)*2 = 0 -> no salta ningún documento
        // - Página 2: skip = (2-1)*2 = 2 -> salta los primeros 2 documentos
        const skip = (page - 1) * itemsPerPage;

        // Hacemos la consulta principal a la base de datos
        const users = await User.find()        // Busca todos los usuarios
            .sort('_id')                       // Los ordena por su ID
            .skip(skip)                        // Salta los documentos según la página
            .limit(itemsPerPage);              // Limita el resultado a 2 usuarios

        // Verificamos si se encontraron usuarios
        if(!users){
            // Si no hay usuarios, devolvemos un error 404 (No encontrado)
            return res.status(404).send({
                message: "No hay usuarios para mostrar"
            });
        }

        // Si todo salió bien, devolvemos la respuesta con:
        return res.status(200).send({
            users: users,                              // Lista de usuarios encontrados
            total: total,                              // Total de usuarios en la BD
            pages: Math.ceil(total/itemsPerPage),      // Calculamos el total de páginas
            page: page                                 // Página actual que estamos viendo
        });

    }catch(err){
        // Si ocurre cualquier error durante el proceso
        // devolvemos un error 500 (Error del servidor)
        return res.status(500).send({
            message: "Error al obtener los usuarios",
            error: err.message                         // Incluimos el mensaje de error específico
        });
    }
}

/*
 ********************************************************************
 * [UPDATEUSER] FUNCION PARA ACTUALIZAR UN USUARIO POR SU ID
 * 
 * Esta función permite actualizar los datos de un usuario.
 * Solo permite actualizar:
 * - nombre
 * - apellido
 * - nick (verificando que no exista)
 * - email (verificando que no exista)
 * 
 * No permite actualizar:
 * - password (tiene su propia función)
 * - role (por seguridad)
 ********************************************************************
*/
async function updateUser(req, res){
    console.log("updateUser");
    try{
        const userId = req.params.id;
        const update = req.body;

        // 1. Verificamos que el usuario exista antes de actualizar
        const userExists = await User.findById(userId);
        if(!userExists){
            return res.status(404).send({message: "El usuario que intentas actualizar no existe"});
        }

        // 2. Si el ID del usuario que está intentando actualizar no coincide con el ID del usuario autenticado, devolvemos un error
        if(userId != req.user.sub){
            return res.status(403).send({message: "No tienes permisos para actualizar este usuario"});
        }

        // 3. Limpiamos datos que no se deben actualizar por este método
        delete update.password;
        delete update.role;
        delete update._id;

        // 4. Si se intenta actualizar email o nick, verificamos que no existan
        if(update.email || update.nick){
            // Buscamos si ya existe un usuario con el mismo email o nick
            const duplicated = await User.findOne({
                $or: [
                    {email: update.email?.toLowerCase()},
                    {nick: update.nick?.toLowerCase()}
                ],
                _id: { $ne: userId }  // Excluimos el usuario actual de la búsqueda
            });

            if(duplicated){
                return res.status(400).send({
                    message: "El email o nick ya está en uso por otro usuario"
                });
            }
        }

        // 5. Actualizamos el usuario
        const userUpdated = await User.findByIdAndUpdate(userId, update, {new: true, runValidators: true});

        // 6. Eliminamos la contraseña del resultado
        userUpdated.password = undefined;

        return res.status(200).send({
            message: "Usuario actualizado correctamente",
            user: userUpdated
        });

    }catch(err){
        // Si el error es de validación, enviamos un 400
        if(err.name === 'ValidationError'){
            return res.status(400).send({
                message: "Error en los datos enviados",
                error: err.message
            });
        }

        // Para otros errores, enviamos un 500
        return res.status(500).send({
            message: "Error al actualizar el usuario",
            error: err.message
        });
    }
}

/*
 * Exportamos todas las funciones del controlador
 * para poder usarlas en las rutas de la aplicación
 */
module.exports = {                    // Exporta las funciones para que otros archivos las usen
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser
};
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
const formidable = require('formidable');  // Importa formidable correctamente
var fs = require('fs');                // Para manejo de archivos
var path = require('path');            // Para manejo de rutas

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
 ********************************************************************
*/
async function updateUser(req, res){
    /*
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
    */
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
 ********************************************************************
 * [UPLOADIMAGE] FUNCIÓN PARA SUBIR IMAGEN DE PERFIL DE USUARIO
 ********************************************************************
*/
async function uploadImage(req, res){
   /*
    * DESCRIPCIÓN:
    * Esta función maneja la subida de imágenes de perfil para los usuarios.
    * Permite a los usuarios subir una imagen, la procesa, valida y almacena
    * en el servidor, actualizando la referencia en la base de datos.
    * 
    * PARÁMETROS DE ENTRADA:
    * - req.params.id: ID del usuario que quiere subir la imagen
    * - req.files: Archivo de imagen enviado en la petición
    * - req.user.sub: ID del usuario autenticado (viene del middleware de auth)
    * 
    * PROCESO:
    * 1. Verifica permisos del usuario
    * 2. Configura formidable para la subida
    * 3. Procesa y valida la imagen
    * 4. Guarda la imagen y actualiza el usuario
    * 
    * RESPUESTAS HTTP:
    * - 200: Imagen subida correctamente
    * - 400: Error en el archivo o formato
    * - 403: Sin permisos para esta acción
    * - 404: Usuario no encontrado
    * - 500: Error interno del servidor
    * 
    * EJEMPLO DE USO (Postman):
    * POST /api/upload-image/123
    * Headers: 
    *   - Authorization: token_jwt
    * Body (form-data):
    *   - image: [archivo de imagen]
   */
    try{
        // 1. VALIDACIÓN DE PERMISOS
        // Extraemos el ID del usuario de los parámetros de la URL
        const userId = req.params.id;

        // Verificamos que el usuario autenticado sea el mismo que quiere actualizar su imagen
        // req.user.sub viene del middleware de autenticación
        if(userId != req.user.sub){
            return res.status(403).send({
                message: "No tienes permisos para actualizar este usuario"
            });
        }

        // 2. CONFIGURACIÓN DE FORMIDABLE
        // Creamos una nueva instancia de formidable para procesar la subida de archivos
        const form = new formidable.IncomingForm({
            uploadDir: './uploads/users',    // Directorio donde se guardarán las imágenes
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
        const finalFileName = `${userId}-${Date.now()}${fileExt}`;
        const finalPath = path.join('./uploads/users', finalFileName); // Ruta final donde se guardará el archivo
        
        // Movemos el archivo de la ubicación temporal a la final
        fs.renameSync(filePath, finalPath);

        // 6. ACTUALIZACIÓN EN BASE DE DATOS
        // Actualizamos el campo 'image' del usuario en MongoDB
        const userUpdated = await User.findByIdAndUpdate(
            userId,                     // ID del usuario a actualizar
            { image: finalFileName },   // Nuevo valor para el campo 'image'
            { new: true }              // Opción para devolver el documento actualizado
        );

        // Verificamos si se actualizó correctamente
        if(!userUpdated){
            return res.status(404).send({
                message: "No se ha podido actualizar la imagen del usuario"
            });
        }

        // 7. RESPUESTA EXITOSA
        // Si todo salió bien, devolvemos la respuesta con los datos actualizados
        return res.status(200).send({
            message: "Imagen subida correctamente",
            user: userUpdated,
            image: finalFileName
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

/*
 ************************************************************************
 * [GETIMAGEFILE] FUNCIÓN PARA OBTENER LA IMAGEN DE PERFIL DE UN USUARIO
 ************************************************************************
 */
async function getImageFile(req, res){

   /*
    * DESCRIPCIÓN:
    * Esta función se encarga de servir las imágenes de perfil de los usuarios
    * almacenadas en el servidor. Busca la imagen solicitada en el directorio
    * de uploads y la envía como respuesta si existe.
    * 
    * PARÁMETROS DE ENTRADA:
    * - req.params.imageFile: Nombre del archivo de imagen a buscar
    * 
    * RESPUESTAS HTTP:
    * - 200: Devuelve la imagen solicitada
    * - 404: La imagen no existe en el servidor
    * - 500: Error interno del servidor
    * 
    * EJEMPLO DE USO:
    * GET /api/get-image-user/usuario123.jpg
    */
    try{
        // Obtenemos el nombre del archivo de imagen desde los parámetros de la URL
        const imageFile = req.params.imageFile;

        // Construimos la ruta absoluta al archivo usando path.resolve
        // Esto nos asegura que la ruta sea correcta independientemente del sistema operativo
        const pathFile = path.resolve('./uploads/users/', imageFile);

        // Verificamos si el archivo existe de manera síncrona
        if(fs.existsSync(pathFile)){
            // Si el archivo existe, lo enviamos como respuesta
            // res.sendFile se encarga de establecer los headers correctos automáticamente
            return res.sendFile(pathFile);
        } else {
            // Si el archivo no existe, enviamos un error 404
            return res.status(404).send({
                message: "La imagen no existe"
            });
        }
    }catch(err){
        // Si ocurre cualquier error durante el proceso
        // enviamos un error 500 (Error del servidor)
        return res.status(500).send({
            message: "Error al obtener la imagen",
            error: err.message
        });
    }
}



/*
 ********************************************************************
 * [EXPORT] EXPORTAMOS TODAS LAS FUNCIONES DEL CONTROLADOR
 ********************************************************************
 * para poder usarlas en las rutas de la aplicación
 */
module.exports = {      // Exporta las funciones para que otros archivos las usen
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile
};
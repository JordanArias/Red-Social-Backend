# Red Social - Backend

Este repositorio contiene la **parte Backend** de la aplicación "Red Social".  
Está desarrollado en **Node.js** con **Express** y **MongoDB**, y gestiona toda la lógica del servidor, autenticación, almacenamiento de datos y comunicación con el Frontend.

---

## 🚀 Tecnologías utilizadas

- Node.js v18.x  
- Express v4.x  
- MongoDB v6.x  
- Mongoose  
- JWT (Json Web Token) para autenticación  
- Bcrypt para cifrado de contraseñas  
- Multer para subida de imágenes  

---

## ⚙️ Funcionalidades principales

- Registro e inicio de sesión de usuarios (con JWT)  
- Gestión de perfiles (edición, imagen, biografía, etc.)  
- Creación, edición y eliminación de publicaciones  
- Sistema de seguidores / seguidos    
- Chat con mensajes privados entre usuarios  
- Feed personalizado con publicaciones de personas seguidas  
- Subida de imágenes al servidor

---

## 🧩 Configuración de la base de datos (MongoDB)
El sistema utiliza MongoDB como base de datos.
Las colecciones se crean automáticamente cuando se insertan los primeros documentos (por ejemplo, al registrar usuarios).
No es necesario crear tablas ni estructuras manualmente.

#### 1. Instalar y ejecutar MongoDB
Asegúrate de tener MongoDB instalado y corriendo en tu máquina local:
Por defecto, el proyecto se conecta a:
```bash
mongodb://localhost:27017/red_social
```

#### 2. (Opcional) Cambiar la URL de conexión:
```bash
mongoose.connect('mongodb://localhost:27017/red_social', { useNewUrlParser: true, useUnifiedTopology: true })
```

Por ejemplo:
```bash
mongoose.connect('mongodb://localhost:27017/mi_base_de_datos')
```

---

## 🧰 Instalación y ejecución
#### 1. Clonar el repositorio:
```bash
git clone https://github.com/JordanArias/Red-Social-Backend.git
```
#### 2. Entrar al directorio:
```bash
cd Red-Social-Backend
```
#### 3. Instalar dependencias:
```bash
npm install
```
#### 4. Ejecutar el servidor:
```bash
npm run dev
```

## 👨‍💻 Autor
**Fabrizio Jordan Arias Marca**  
📧 ariasjordan943@gmail.com  
🌐 [jordandeveloper.netlify.app](https://jordandeveloper.netlify.app)

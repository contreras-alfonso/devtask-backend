import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
import { conectarDB }  from "./config/db.js";
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'


const app = express();

app.use(express.json());

dotenv.config();

conectarDB();

//Configurar CORS

const whitelist = [process.env.FRONTEND_URL,"https://api.sendgrid.com"]

const corsOptions = {
    origin: function(origin,callback){
        console.log(origin)
        if(whitelist.includes(origin)){
            // Pueda Consultar la API
            callback(null,true);
        }else{
            // No está permitido
            callback(new Error('Error de Cors'))
        }
    } 
} 

app.use(cors(corsOptions))

//Routing

app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

app.listen(process.env.PORT,()=>{
    console.log('Servidor corriendo en el puerto: '+process.env.PORT)
})
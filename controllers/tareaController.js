import Proyecto from "../models/proyectoModel.js"
import Tarea from "../models/tareaModel.js"
import mongoose from "mongoose";

const agregarTarea = async (req,res) => {
    const {proyecto:idProyecto} = req.body;
    //validar el id 
    const valid = mongoose.Types.ObjectId.isValid(idProyecto);
    if(!valid) return res.json({msg:'Proyecto no encontrado',status:false})
    //buscar el proyecto
    const proyecto = await Proyecto.findById(idProyecto);
    //validar que el proyecto sea del usuario que lo está creando
    if(!proyecto.creador.equals(req.usuario._id)) return res.json({msg:'Acceso no permitido'});

    try {
        const tarea = new Tarea(req.body);
        await tarea.save();
        //Almacenar el ID en el proyecto
        proyecto.tareas.push(tarea._id)
        await proyecto.save();
        res.json({data:tarea,msg:'Tarea creada correctamente.',status:true})
    } catch (error) {
        console.log(error)
    }

}

const obtenerTarea = async (req,res) => {
    const { id } = req.params;
    //validar el id 
    const valid = mongoose.Types.ObjectId.isValid(id);
    if(!valid) return res.json({msg:'Tarea no encontrada'})
    //buscar la tarea
    const tarea = await Tarea.findById(id).populate('proyecto');
    if(!tarea) return res.json({msg:'Tarea no encontrada'});
    //validar el usuario que le pertenezca el proyecto
    if(!tarea.proyecto.creador.equals(req.usuario._id)){ 
        return res.json({msg:'Acceso no permitido'});
    }
    
    return res.json(tarea);

}

const actualizarTarea = async (req,res) => {

    const { id } = req.params;
    //validar el id 
    const valid = mongoose.Types.ObjectId.isValid(id);
    if(!valid) return res.json({msg:'Tarea no encontrada',status:false})
    //buscar la tarea
    const tarea = await Tarea.findById(id).populate('proyecto');
    if(!tarea) return res.json({msg:'Tarea no encontrada',status:false});
    //validar el usuario que le pertenezca el proyecto
    if(!tarea.proyecto.creador.equals(req.usuario._id)){ 
        return res.json({msg:'Acceso no permitido',status:false});
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
        const tareaAlmacenada = await tarea.save();
        res.json({data:tareaAlmacenada,status:true,msg:'Tarea Actualizada correctamente.'});
    } catch (error) {
        console.log(error)
    }
}

const eliminarTarea = async (req,res) => {

    const { id } = req.params;
    //validar el id 
    const valid = mongoose.Types.ObjectId.isValid(id);
    if(!valid) return res.json({msg:'Tarea no encontrada'})
    //buscar la tarea
    const tarea = await Tarea.findById(id).populate('proyecto');
    if(!tarea) return res.json({msg:'Tarea no encontrada',status:false});
    //validar el usuario que le pertenezca el proyecto
    if(!tarea.proyecto.creador.equals(req.usuario._id)){ 
        return res.json({msg:'Acceso no permitido',status:false});
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto);
        proyecto.tareas.pull(tarea._id)
        await Promise.allSettled([await proyecto.save(),await tarea.deleteOne()])
        res.json({msg:'Proyecto eliminado correctamente.',status:true});
    } catch (error) {
        console.log(error)
    }
    
}

const cambiarEstado = async (req,res) => {
    const { id } = req.params;
    console.log(id);
    //validar el id 
    // const valid = mongoose.Types.ObjectId.isValid(id);
    // if(!valid) return res.json({msg:'Tarea no encontrada',status:false})
    //buscar la tarea
    const tarea = await Tarea.findById(id).populate('proyecto');
    if(!tarea) return res.json({msg:'Tarea no encontrada',status:false});
    //validar el usuario que le pertenezca el proyecto
    if(!tarea.proyecto.creador.equals(req.usuario._id) && !tarea.proyecto.colaboradores.some(e=>e._id.toString()===req.usuario._id.toString())){ 
        return res.json({msg:'Acceso no permitido',status:false});
    }
    tarea.estado = !tarea.estado
    try {
        await tarea.save();
        res.json({msg:tarea,status:true})
    } catch (error) {
        res.json({msg:'Ocurrió un error al actualizar la tarea',status:false})
    }
  

}

export{
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}
import mongoose from "mongoose";
import Proyecto from "../models/proyectoModel.js"
import Tarea from "../models/tareaModel.js";
import Usuario from "../models/usuarioModel.js";

const obtenerProyectos = async (req,res) => {

    const proyectos = await Proyecto.find({
        '$or':[
            {'colaboradores':{$in:req.usuario}},
            {'creador':{$in:req.usuario}},
        ]
    }).select('-tareas');
    //const proyectos = await Proyecto.find().where('creador').equals(req.usuario);
    res.json(proyectos);
}

const nuevoProyecto = async (req,res) => {

    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;
    
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);

}

const obtenerProyecto = async (req,res) => {

    const { id } = req.params;
    
    const valid = mongoose.Types.ObjectId.isValid(id);

    if(!valid) return res.json({msg:'Proyecto no encontrado',status:false})

    const proyecto = await Proyecto.findById(id).populate('tareas').populate('colaboradores',"nombre email");

    if(!proyecto) return res.json({msg:'No existe el proyecto con dicho id',status:false})

    if(!proyecto.creador.equals(req.usuario._id) && !proyecto.colaboradores.some(e=>e._id.toString() === req.usuario._id.toString())){
        return res.json({msg:'Acceso no permitido',status:false})
    }

    //obtener Tareas del proyecto

    res.json({msg:proyecto,status:true});

}

const editarProyecto = async (req,res) => {

    const { id } = req.params;
    
    const valid = mongoose.Types.ObjectId.isValid(id);

    if(!valid) return res.json({msg:'Proyecto no encontrado'})

    const proyecto = await Proyecto.findById(id);

    if(!proyecto) return res.json({msg:'No existe el proyecto con dicho id'})

    if(!proyecto.creador.equals(req.usuario._id)){
        return res.json({msg:'Acceso no permitido'})
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error)
    }

}

const eliminarProyecto = async (req,res) => {

    const { id } = req.params;
    
    const valid = mongoose.Types.ObjectId.isValid(id);

    if(!valid) return res.json({msg:'Proyecto no encontrado'})

    const proyecto = await Proyecto.findById(id);

    if(!proyecto) return res.json({msg:'No existe el proyecto con dicho id'})

    if(!proyecto.creador.equals(req.usuario._id)){
        return res.json({msg:'Acceso no permitido'})
    }

    try {
        await proyecto.deleteOne();
        res.json({msg:'Proyecto eliminado',status:true})
    } catch (error) {
        console.log(error)
    }
}

const agregarColaborador = async (req,res) => {
    const proyecto = await Proyecto.findById(req.params.id);
    if(!proyecto){
        return res.json({msg:'No se encontró el proyecto',status:false})
    }


    //verificar permisos
    if(!proyecto.creador.equals(req.usuario._id)){
        return res.json({msg:'Accion no válida',status:false})
    }

    const { email } = req.body;

    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');


    if(!usuario?._id){
        return res.json({msg:'No se encontró ningun usuario con dicho email.', status:false});
    }
    //Revisar que el usuario no se agrege a su propio proyecto
    if(proyecto.creador.equals(usuario._id)){
        return res.json({msg:'No te puedes agregar como colaborador a tu propio proyecto.',status:false})
    }

    //Revisar que no esté ya en el proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        return res.json({msg:'El usuario ya está agregado al proyecto.', status:false});
    }

    proyecto.colaboradores.push(usuario._id);

    await proyecto.save();

    res.json({msg:'Colaborador agregado correctamente.',status:true})


}

const BuscarColaborador = async (req,res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');


    if(!usuario?._id){
        return res.json({msg:'No se encontró ningun usuario con dicho email.', status:false});
    }
    return res.json({msg:usuario,status:true});
}

const eliminarColaborador = async (req,res) => {

    const proyecto = await Proyecto.findById(req.params.id);
    if(!proyecto){
        return res.json({msg:'No se encontró el proyecto',status:false})
    }

    //verificar permisos
    if(!proyecto.creador.equals(req.usuario._id)){
        return res.json({msg:'Accion no válida',status:false})
    }

    proyecto.colaboradores.pull(req.body._id);

    await proyecto.save();

    res.json({msg:'Colaborador eliminado correctamente.',status:true})

}

const obtenerTareas = async (req,res) => {

    const { id } = req.params;

    //validar el acceso
    const proyecto = await Proyecto.findById(id);
    if(!proyecto.creador.equals(req.usuario._id)) return res.json({msg:'Acceso no permitido'});

    const valid = mongoose.Types.ObjectId.isValid(id);
    if(!valid) return res.json({msg:'Proyecto no encontrado'})

    const tareas = await Tarea.find().where('proyecto').equals(id);

    res.json(tareas)
    
}

export{
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    BuscarColaborador,
    eliminarColaborador,
    obtenerTareas,
}
import Usuario from "../models/usuarioModel.js";
import bcrypt from 'bcrypt';
import { generarTokenEmail, generarJWT } from "../helpers/herlpers.js";
import enviarEmailVerificacionCuenta from "../helpers/enviarCorreoVerificacion.js";
import enviarCorreoOlvidoPassword from "../helpers/enviarCorreoOlvidoPassword.js";

const registrar = async (req,res) => {

    //evitar Registros duplicados
    const { email } = req.body;
    const existeEmail = await Usuario.findOne({email});


    if(existeEmail){
        return res.json({msg:"Usuario ya existente.",status:false})
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarTokenEmail();
        const usuarioAlmacenado = await usuario.save();
        enviarEmailVerificacionCuenta(usuarioAlmacenado.nombre,usuarioAlmacenado.token);
        res.json({msg:`Revisa tu bandeja de entrada para confirmar tu cuenta o revisa los mensajes del spam.`,status:true})
    } catch (error) {
        console.log(error)
    }


}

const login = async (req,res) => {

    const {email,password} = req.body

    const usuario = await Usuario.findOne({email});

    if(!usuario){
        return res.json({msg:'Usuario o contraseña incorrecta.',status:false});
    }

    //exist user then, verify his password
    const passwordCorrecto = await bcrypt.compare(password,usuario.password)

    if(!passwordCorrecto){
        return res.json({msg:'Usuario o contraseña incorrecta.',status:false})
    }
    
    //verificar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.json({msg:'Aún no has confirmado tu cuenta.',status:false})
    }

    return res.json({
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        token: generarJWT(usuario.id),
  
    });
}   

const confirmar = async (req,res) => {
    const {token} = req.params;
    const usuario = await Usuario.findOne({token});
    if(!usuario){
        res.json({msg:'El token no es válido',status:false});
        return;
    }
    //si el token si está asociado, =>
    usuario.confirmado = true;
    usuario.token = '';
    await usuario.save();
    res.json({msg:'Cuenta Confirmada Correctamente.',status:true})
}

const olvidePassword = async (req,res) => {

    const {email} = req.body;

    const usuario = await Usuario.findOne({email});

    if(!usuario){
        return res.json({msg:'El correo ingresado no está asociado a ninguna cuenta.',status:false});
    }

    if(!usuario.confirmado){
        res.json({msg:'El usuario aún no está confirmado.',status:false})
        return;
    }

    usuario.token = generarTokenEmail();

    await usuario.save();

    enviarCorreoOlvidoPassword(usuario.nombre,usuario.token);

    res.json({msg:'Hemos enviado un correo de recuperación a su email.',status:true})

}

const validarToken = async (req,res) => {

    const {token} = req.params
    const usuario = await Usuario.findOne({token});
    if(!usuario){
        res.json({msg:'Token no valido',status:false})
        return;
    }

    if(!usuario.confirmado){
        res.json({msg:'Usuario no está confirmado',status:false})
        return;
    }

    res.json({msg:'Token valido.',status:true})

}

const nuevoPassword = async (req,res) => {

    const {token} = req.params
    const usuario = await Usuario.findOne({token});
    if(!usuario){
        res.json({msg:'Token no valido.',status:false})
        return;
    }

    if(!usuario.confirmado){
        res.json({msg:'El usuario no está confirmado',status:false})
        return;
    }

    const { password } = req.body
    usuario.password = password
    usuario.token = ''
    await usuario.save();
    
    res.json({msg:'Password modificado correctamente.',status:true})
}

const perfil = async (req,res) => {
    const {usuario} = req

    res.json(usuario)
}



export {
    registrar,
    login,
    confirmar,
    olvidePassword,
    validarToken,
    nuevoPassword,
    perfil,
   
}
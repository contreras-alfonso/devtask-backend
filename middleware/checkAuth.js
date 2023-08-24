import jwt from 'jsonwebtoken'
import Usuario from '../models/usuarioModel.js';

const checkAuth = async (req,res,next) => {

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token,process.env.JWT_SECRET);

            req.usuario = await Usuario.findOne({_id:decoded.id}).select("-password -token -confirmado -createdAt -updatedAt -__v");

            next()

        } catch (error) {
            return res.status(404).json({msg:'Hubo un error'})
        }
    }

    if(!token){
        res.status(401).json({msg:"Token no válido"})
        return;
    }

}

export default checkAuth;
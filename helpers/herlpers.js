import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail'

const generarTokenEmail = ()=>{
    return Math.random().toString(32).substring(2)+Date.now().toString(32);
}

const generarJWT = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET , { expiresIn: '1d' });
}


export{
    generarTokenEmail,
    generarJWT,
}
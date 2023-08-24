import express from 'express';
const router = express.Router();

import { registrar,login, confirmar, olvidePassword, validarToken, nuevoPassword, perfil} from '../controllers/usuarioController.js';
import checkAuth from '../middleware/checkAuth.js';

router.post('/register',registrar); // crea un nuevo usuario
router.post('/login',login);
router.get('/confirmar/:token',confirmar);
router.post('/olvide-password',olvidePassword);
router.get('/olvide-password/:token',validarToken);
router.post('/olvide-password/:token',nuevoPassword);
// router.route('/olvide-password/:token').get(validarToken).post(nuevoPassword);
router.get('/perfil',checkAuth,perfil);


export default router
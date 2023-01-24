import express from 'express';
import User from '../Schemas/user.js';
import { validateUserName } from '../Middlewares/userName.js';
const routerUsers = express.Router();
import generateJWT from '../Utils/utils.js';
const jwtSecret = process.env.JWT_SECRET;
import { jwtMiddleware } from '../Middlewares/jwtMiddleware.js';

routerUsers.get('/user', async (req, res) => {
    try {
        const allUsers = await User.find();
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json(error)
    }
});

routerUsers.get('/user/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        if (user) {
            res.status(200).json(user)
        } else {
            res.status(404).send('No existe este usuario')
        }
    } catch (error) {
        res.status(500).json(error)
    }
});

// app.use(validateUserName);

routerUsers.post('/user', validateUserName, async (req, res) => {
    try {

        const emailExist = await User.findOne({ email: req.body.email })
        const userNameExist = await User.findOne({ email: req.body.userName })

        if (!req.body.email) return res.status(404).json({ message: "No hay email" }) // Validar que viene un mail en el body

        if (emailExist) return res.status(400).json({ message: "El email ya existe" }) // Comprobar que el mail no existe
        if (userNameExist) return res.status(400).json({ message: "El nombre de usuario ya existe" }) // Comprobar que el userName no existe

        const user = new User(req.body)

        //antes de grabarse se ejecuta la función PRE del schema
        const userCreated = await user.save();

        const userToken = generateJWT(userCreated);

        //Crearmos otro objeto para no enviar la contraseña
        const resUser = {
            userName: userCreated.userName,
            _id:userCreated._id,
            email: userCreated.email,
            name: userCreated.name,
            lastName: userCreated.lastName
        }

        return res.status(201).json({ resUser, userToken })

    } catch (e) { return res.status(500).json({ message: `el error es ${e}` }) }
});

routerUsers.post('/register', validateUserName, async (req, res) => {
    try {

        const emailExist = await User.findOne({ email: req.body.email })
        const userNameExist = await User.findOne({ email: req.body.userName })

        if (!req.body.email) return res.status(404).json({ message: "No hay email" }) // Validar que viene un mail en el body

        if (emailExist) return res.status(400).json({ message: "El email ya existe" }) // Comprobar que el mail no existe
        if (userNameExist) return res.status(400).json({ message: "El nombre de usuario ya existe" }) // Comprobar que el userName no existe

        const user = new User(req.body)

        //antes de grabarse se ejecuta la función PRE del schema
        const userCreated = await user.save();

        const userToken = generateJWT(userCreated);

        //Crearmos otro objeto para no enviar la contraseña
        const resUser = {
            userName: userCreated.userName,
            _id:userCreated._id,
            email: userCreated.email,
            name: userCreated.name,
            lastName: userCreated.lastName
        }

        return res.status(201).json({ resUser, userToken })

    } catch (e) { return res.status(500).json({ message: `el error es ${e}` }) }
});

routerUsers.patch('/user/:id', validateUserName, async (req, res) => {
    try {
        const userModified = await User.findByIdAndUpdate(req.params.id, req.body);
        if (userModified) {
            res.status(200).json(userModified)
        } else {
            res.status(404).send('Usuario no encontrado')
        }
    } catch (error) {
        res.status(500).json(error)
    }
});

routerUsers.delete('/user/:id', async (req, res) => {
    const id = req.params.id
    try {
        const userDelete = await User.findByIdAndDelete(id)
        res.status(204).send('Usuario eliminado')
    } catch (error) {
        res.status(500).json(error)
    }
});

export default routerUsers;
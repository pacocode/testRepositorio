const User = require("../models/User");
const {validationResult} = require('express-validator');
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config()

const registerForm = (req, res) => {
    res.render('register' /*, {mensajes: req.flash('mensajes')}*/);
}

const registerUser = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        //return res.json(errors);
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/register');
    }

    const {userName, email, password} = req.body;

    try {

        let user = await User.findOne({email: email});

        if(user) throw new Error ('Ya existe usuario');

        user = new User({userName, email, password, tokenConfirm: nanoid() });
        
        await user.save();

        // Enviar email con la confirmación de la cuenta
        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.USEREMAIL,
              pass: process.env.PASSEMAIL
            }
        });

        await transport.sendMail({
            from: '"Pechugas Laru" <foo@example.com>',
            to: user.email,
            subject: "Verifica tu cuenta de usuario",
            html: `<a href="http://${process.env.PATHHEROKU  || 'localhost:4040'}auth/confirmar/${user.tokenConfirm}">Verificat Token</a>`
        });


        req.flash("mensajes", [{msg: "Revisa tu correo electronico y valida cuenta"}]);
        
        return res.redirect('/auth/login');

    } catch (error) {
        //res.json({error: error.message});
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/register');
    }
}

const confirmarCuenta = async (req, res) => {
    const {token} = req.params;

    try{
        const user = await User.findOne({tokenConfirm: token});
        
        if(!user) throw new Error ('No existe este usuario');

        user.cuentaConfirmada = true;
        user.tokenConfirm = null;

        await user.save();

        req.flash("mensajes", [{msg: "Cuenta verificada, puedes iniciar sesion"}]);

        res.redirect('/auth/login');

    } catch (error){
        //res.json({error: error.message})
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/login');
    }
    
}


const loginForm = (req, res) => {
    res.render('login'/*, {mensajes: req.flash('mensajes')}*/);
}

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/login');
    }

    const {email, password} = req.body;
    try{

        const user = await User.findOne({email});
        if(!user) throw new Error('No existe este email');

        if(!user.cuentaConfirmada) throw new Error('Falata confirmar cuenta');

        if(!await user.comparePassword(password)) throw new Error('Contaseña o cuenta invalida');

        //Me esta creando la sesión de usuario a travez de passport
        req.login(user, function(err){
            if(err) throw new Error ('Error al crear la sesion');
            res.redirect('/');    
        });

    } catch (error){
        //console.log(error);
        //res.send(error.message);
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/login');
    }
}

const cerrarSesion = (req, res) => {
    req.logout(function(error){
        if(error){
            return next(error);
        }
        return res.redirect('/auth/login');
    });
}

module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion
}
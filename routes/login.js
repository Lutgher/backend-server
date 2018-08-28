const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const app=express();
const Usuario=require('../models/usuario');
const SEED=require('../config/config').SEED;

app.post('/',(req, res)=>{

    let body=req.body;

    Usuario.findOne({email: body.email},(err, usuarioBD)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar al usuario',
                error: err
            });
        }
        if(!usuarioBD){
            return res.status(400).json({
                ok: true,
                mensaje: 'Las credenciales son incorrectas - email',
                error:err
            });
        }
        if(!bcrypt.compareSync(body.password, usuarioBD.password)){
            return res.status(400).json({
                ok: true,
                mensaje: 'Las credenciales son incorrectas - password',
                error:err
            });
        }
        //crear un token
        usuarioBD.password=':)';
        let token=jwt.sign({usuario: usuarioBD},SEED,{ expiresIn: 14400});

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });

    });

    
});



module.exports=app;
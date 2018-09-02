const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const app=express();
const Usuario=require('../models/usuario');
const SEED=require('../config/config').SEED;

//google
const CLIENT_ID=require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/*================================================
Autenticación Google
================================================*/

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }
  
app.post('/google',async(req, res)=>{


    let token=req.body.token;
    let googleUser=await verify(token).catch(e=>{return res.status(403).json({ok: false, mensaje:'Token no válido'})});

    Usuario.findOne({email: googleUser.email }, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'error al buscar usuario',
                error: err
            });
        }
        if(usuarioDB){

            if(usuarioDB.google===false){
                return res.status(400).json({
                    ok: false,
                    mensaje:'error al buscar usuario',
                    error: err
                });
            }else{
                // usuarioBD.password=':)';
                let token=jwt.sign({usuario: usuarioDB},SEED,{ expiresIn: 14400});

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        }else{
            //el usuario no existe
            let usuario=new Usuario();
            usuario.nombre=googleUser.nombre;
            usuario.email=googleUser.email;
            usuario.img=googleUser.img;
            usuario.password=':)';
            usuario.google=true;

            usuario.save((err, usuarioDB)=>{
                return res.status(500).json({
                    ok: false,
                    mensaje:'error al buscar usuario',
                    error: err
                });

                let token=jwt.sign({usuario: usuarioBD},SEED,{ expiresIn: 14400});

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            });
        }
    });
    // res.status(200).json({
    //     ok: true,
    //     mensaje:'Probando con google',
    //     googleUser: googleUser
    // });
});

/*================================================
Autenticación Normal
================================================*/
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
const express=require('express');
const bcrypt=require('bcryptjs');
const app=express();
// const jwt=require('jsonwebtoken');

const mdautenticacion=require('../middlewares/autenticacion');

let Usuario=require('../models/usuario');
/* ================================
Lista todos los usuarios
=================================*/
app.get('/',(req, res, next)=>{

    Usuario.find({},'nombre email img role',
    (err, usuarios)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error de cargar usuario',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarios
        });
    });
    
});


/* ================================
Actualizar un nuevo usuario
=================================*/
app.put('/:id', mdautenticacion.verificaToken,(req, res)=>{
    let id=req.params.id;
    let body=req.body;

    Usuario.findById(id, (err, usuario)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar el usuario',
                error: err
            });
        }

        if(!usuario){
            return res.status(401).json({
                ok: false,
                mensaje:'El usuario con el ID no existe',
                error: err
            });
        }

        usuario.nombre=body.nombre;
        usuario.email=body.email;
        usuario.role=body.role;    
        
        usuario.save((err, usuarioGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    error: err
                });
            }

            usuarioGuardado.password=':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

    
});

/* ================================
Crear un nuevo usuario
=================================*/
app.post('/', mdautenticacion.verificaToken,( req, res)=>{
    let body=req.body;

    let usuario=new Usuario({
        nombre: body.nombre,
        email:  body.email.toLowerCase(),
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

    
});
/* ================================
Eliminación usuario por id
=================================*/
app.delete('/:id', mdautenticacion.verificaToken,(req, res)=>{
    let id=req.params.id;
     Usuario.findByIdAndRemove(id,(err, usuarioEliminado)=>{
         if(err){
             return res.status(500).json({
                 ok: false,
                 mensaje:'Fallo la elminación',
                 error: err
             });
         }

         if(!usuarioEliminado){
            return res.status(400).json({
                ok: false,
                mensaje:'No existe el usuario con el ID',
                error: err
            });
         }

         res.status(200).json({
             ok: true,
             usuario: usuarioEliminado
         });
     });
});


module.exports=app;
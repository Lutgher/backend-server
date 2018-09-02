const express=require('express');
const app=express();
const mdautenticacion=require('../middlewares/autenticacion');

let Hospital=require('../models/hospital');

app.get('/',(req, res, next)=>{
    let desde=req.query.desde || 0;
    desde=Number(desde);
    let limite=req.query.limite || 5;
    limite=Number(limite);
    Hospital.find({})
    .sort('nombre')
    .skip(desde)
    .limit(limite)
    .populate('usuario','nombre email')
    .exec((err, hospitales)=>{
        if(err){
            return res.status(500).json({
                ok: true,
                mensaje:'Error de carga de hospitales',
                error: err
            });
        }

        Hospital.count({},(err, conteo)=>{
            res.status(200).json({
                ok: true,
                hospital: hospitales,
                total: conteo
            });
        });

        // res.status(200).json({
        //     ok: true,
        //     hospital: hospitales
        // });
    });
});

app.put('/:id',mdautenticacion.verificaToken,(req, res)=>{
    let id=req.params.id;
    let body=req.body;

    Hospital.findById(id,(err, hospital)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                error: err
            });
        }
        if(!hospital){
            return res.status(401).json({
                ok: false,
                mensaje:'El usuario con el id no existe',
                error: err
            });
        }
        hospital.nombre=body.nombre;
        hospital.img=body.img;
        hospital.usuario=req.usuario._id;

        hospital.save((err, hospitalGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    error: err
                });
            }
            res.status(200).json({
                ok:true,
                hospital: hospitalGuardado
            });
        });

    });
});

app.post('/',mdautenticacion.verificaToken,(req, res)=>{
    let body=req.body;

    let hospital=new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

app.delete('/:id',mdautenticacion.verificaToken,(req, res)=>{
    let id=req.params.id;
    Hospital.findByIdAndRemove(id,(err, hospitalEliminado)=>{
        if(err){
            return res.status(500).json({
                ok: true,
                mensaje:'Fallo la eliminación',
                error: err
            });
        }
        if(!hospitalEliminado){
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe el Hospital en la base de datos',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    });
});

module.exports=app;
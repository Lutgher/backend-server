const express=require('express');
const app=express();
const mdautenticacion=require('../middlewares/autenticacion');

const Medico=require('../models/medico');

app.get('/',(req, res, next)=>{

    let desde=req.query.desde||0;
    desde=Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(2)
    .populate('usuario','nombre email')
    .populate('hospital','nombre')
    .exec((err, medicos)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error de cargar hospitales',
                error: err
            });
        }
        Medico.count({},(err, conteo)=>{
            res.status(200).json({
                ok: true,
                medico: medicos
            });
        });
    });
});
app.post('/', mdautenticacion.verificaToken,(req, res)=>{
    let body=req.body;

    let medico=new Medico({
        nombre: body.nombre, 
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error de crear el medico',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});

app.put('/:id',  mdautenticacion.verificaToken,(req, res)=>{
    let id=req.params.id;
    let body=req.body;

    Medico.findById(id,(err, medico)=>{
        if(err){
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar al médico',
                error: err
            });
        }
        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el médico con el ID',
                error: err
            });
        }
        medico.nombre=body.nombre;
        medico.img=body.img;
        medico.usuario=req.usuario._id;
        medico.hospital=body.hospital;

        medico.save((err, medicoGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar el médico',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

app.delete('/:id',mdautenticacion.verificaToken,(req, res)=>{
    let id=req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoEliminado)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Fallo la eliminación',
                error: err
            });
        }
        if(!medicoEliminado){
            return res.status(400).json({
                ok: false,
                mensaje:'No existe el médico',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Medico eliminado',
            medico: medicoEliminado
        });
    });
});
module.exports=app;
const express=require('express');
const app=express();
const Hospital=require('../models/hospital');
const Medico=require('../models/medico');
const Usuario=require('../models/usuario')

app.get('/todo/:busqueda',(req, res, next)=>{

    let busqueda=req.params.busqueda;
    let regex=new RegExp(busqueda, 'i');

    Promise.all( [ 
        buscarHospital(busqueda, regex),
        buscarMedico(busqueda, regex),
        buscarUsuario(busqueda, regex)] )
    .then(respuestas=>{
        res.status(200).json({
            ok: true,
            hospital: respuestas[0],
            medico: respuestas[1],
            usuario: respuestas[2]
        });
    });    
});

app.get('/coleccion/:tabla/:busqueda',(req, res)=>{
    let busqueda=req.params.busqueda;
    let tabla=req.params.tabla;
    let regex=new RegExp(busqueda,'i');
    let promesa;

    switch(tabla){
        case 'usuarios':
            promesa = buscarUsuario(busqueda,regex)
        break;
        case 'medicos':
            promesa = buscarMedico(busqueda,regex)
        break;
        case 'hospitales':
            promesa = buscarHospital(busqueda,regex)
        break;
        default:
        return res.status(400).json({
            ok: false,
            mensaje:'Los tipos de búsqueda son: usuario, medico y hospitales',
            error:{message:'Tipo de tabla(colección no valida'}
        });
    }

    promesa.then(data=>{
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});
//promesas asincronas

function buscarHospital(busqueda, regex){

    return new Promise((resolve, reject)=>{
        Hospital.find({ nombre: regex })
            .populate('usuario','nombre')
            .exec((err, hospitales)=>{
                if(err){
                    reject('error al listar hospital', err);
                }else{
                    resolve(hospitales);
                }
        });
    });

}

function buscarMedico(busqueda, regex){
    return new Promise((resolve, reject)=>{
        Medico.find({ nombre: regex },(err, medicos)=>{
            if(err){
                reject('error al listar médicos',err);
            }else{
                resolve(medicos);
            }
        });
    });
}

function buscarUsuario(busqueda, regex){
    return new Promise((resolve, reject)=>{
        Usuario.find({},'nombre email')
        .or([ { 'nombre': regex },{ 'email': regex }])
        .exec((err, usuarios)=>{
            if(err){
                reject('error al cargar usuarios',err)
            }else{
                resolve(usuarios);
            }
        });
    });
}

module.exports=app;
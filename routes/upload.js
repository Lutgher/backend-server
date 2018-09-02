const express=require('express');
const fileUpload=require('express-fileupload');
const fs=require('fs');
const app=express();
const Usuario=require('../models/usuario');
const Medico=require('../models/medico');
const Hospital=require('../models/hospital');

//middleware
app.use(fileUpload());


app.put('/:tipo/:id',(req, res, next)=>{

    let tipo=req.params.tipo;
    let id=req.params.id;
    //tipos de colección
    let tiposValidos=['hospitales','medicos','usuarios'];
    if(tiposValidos.indexOf( tipo )<0){
        return res.status(400).json({
            ok: false,
            mensaje:'Tipo de colección no válida',
            error:{message:'Tipo de colección no es válida'}
        });
    }

    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'Error de cargado ',
            error:{message: 'debe re seleccionar una imagen'}
        });
    }

    let archivo=req.files.imagen;
    let nombreCorto=archivo.name.split('.');
    let extensionArchivo=nombreCorto[ nombreCorto.length -1];

    //extensiones validas
    let extensionValidas=['jpg','png','gif','jpeg'];
    if( extensionValidas.indexOf(extensionArchivo)<0 ){
        return res.status(400).json({
            ok: true,
            mensaje: 'Extensión no válida',
            error: {message: `Extensiones válidas son ${ extensionValidas.join(', ')}`}
        });
    }

    //Nombre archivo personalizado
    let nombreArchivo =`${ id }-${new Date().getMilliseconds()}.${ extensionArchivo }`;

    //mover el archivo temporal a un path
    let path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error: err
            });
        }

        subirTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje:'archivo movido',
        //     extensionArchivo: extensionArchivo
        // });

    });

});


function subirTipo(tipo, id, nombreArchivo, res){

    if(tipo==='usuarios'){
        Usuario.findById(id,(err,usuario)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al cargar la imagen',
                    error: err
                });
            }
            let pathViejo=`./uploads/usuarios/${usuario.img}`;
            //si exite elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            usuario.img=nombreArchivo;
            usuario.save((err,usuarioActualizado)=>{
                usuarioActualizado.password=';)';
                return res.status(200).json({
                    ok: true,
                    mensaje:'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }
    if(tipo==='hospitales'){
        Hospital.findById(id,(err, hospital)=>{
            let pathViejo=`./uploads/hospitales/${hospital.img}`;
            //elimina si existe la imagen del hospital
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            hospital.img=nombreArchivo;
            hospital.save((err,hospitalActualizado)=>{
                return res.status(200).json({
                    ok:true,
                    mensaje: 'Imagen del hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });
            });
        });
    }
    if(tipo==='medicos'){
        Medico.findById(id,(err, medico)=>{
            let pathViejo=`./uploads/medicos/${medico.img}`;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            medico.img=nombreArchivo;
            medico.save((err,medicoActualizado)=>{
                return res.status(200).json({
                    ok: true,
                    mensaje:'medico actualizado imagen',
                    medicoActualizado
                });
            });
        })
    }
}

module.exports=app;
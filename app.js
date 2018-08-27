const express=require('express');
const mongoose=require('mongoose');

//inicializar varaibles
let app=express();
//conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/cajaDB',(err, res)=>{
    if(err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m','Online');

});

//RUTAS
app.get('/', (req, res, next)=>{
    res.status(200).json({
        Ok: true,
        mensaje:'Petición realizada correctamente'
    });
});

//Escuchar peticiones
app.listen(3000,()=>{
    console.log('Funcionando correctamente el servidor por el puerto 3000: \x1b[32m%s\x1b[0m','Online');
});
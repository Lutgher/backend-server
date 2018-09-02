const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');


//inicializar varaibles
let app=express();
//configuración del body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Importando rutas
const appRoutes=require('./routes/app');
const usuarioRoutes=require('./routes/usuario');
const loginRoutes=require('./routes/login');
const hospitalRoutes=require('./routes/hospital');
const medicoRoutes=require('./routes/medico');
const busquedaRoutes=require('./routes/busqueda');
const uploadRoutes=require('./routes/upload');
const imagensRoutes=require('./routes/imagenes');
//conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/cajaDB',(err, res)=>{
    if(err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m','Online');

});
//RUTAS

app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);
app.use('/hospital',hospitalRoutes);
app.use('/medico',medicoRoutes);
app.use('/busqueda',busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagensRoutes);
app.use('/',appRoutes);

//Escuchar peticiones
app.listen(3000,()=>{
    console.log('Funcionando correctamente el servidor por el puerto 3000: \x1b[32m%s\x1b[0m','Online');
});
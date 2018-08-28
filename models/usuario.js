const mongoose=require('mongoose');
const uniqueValidator=require('mongoose-unique-validator');
const Schema=mongoose.Schema;

const rolesValido={
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

const usuarioSchema = new Schema({
    nombre: { type: String, required: [true,'El nombre es nesecario']},
    email: {type: String, unique:[true,'El correo ya esta registrado'], required:[true,  'El Email es nesecario']},
    password: {type: String, required:[true,'La contraseña es obligatorio']},
    img: { type: String, required:false },
    role: { type: String, required: true, default:'USER_ROLE', enum: rolesValido}
});

usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser único' } );
module.exports = mongoose.model('Usuario',usuarioSchema);
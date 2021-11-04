const debug= require("debug")("app:inicio");
//const dbDebug= require("debug")("app:db");
const express=require("express");
const config=require("config");
//const logger=require("./logger");
const morgan=require("morgan");
const Joi=require("joi");
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

/* app.use(function(req, resp, next){
    console.log("logging...");
    next();
}) */

//app.use(logger);

//configuración de variables de entorno
console.log('Aplicación:'+ config.get("nombre"));
console.log('DB server:'+ config.get("configDB.host"));

//Uso de middleware de terceros - Morgan
if(app.get("env")==="development"){
    app.use(morgan('tiny'));
    /* console.log("morgan habilitado"); */
    debug("Morgan está habilitado..");
}
//Trabajos con la base de datos
debug("Conectando con la bd...");


const usuarios=[
    {'id':1,'nombre':'Jhonny'},
    {'id':2,'nombre':'Edu'},
    {'id':3,'nombre':'Carl'},
]

app.get('/',(req,res)=>{
    res.send('Hola mundo en express');
});

app.get('/api/jc_code', (req,res)=>{
    res.send("Nueva url disponible");
})

/* app.get('/api/jc_code/:dia/:mes', (req,res)=>{
    //res.send("Nueva url disponible");
    //res.send(req.params.dia);//enviando parámetros por url
    //res.send(req.params);
    res.send(req.query);//enviando las variables pasadas por querystrings
}) */
//Peticiones get con http
app.get('/api/peticion', (req,res)=>{
    res.send(usuarios);
})
/* app.get('/api/peticion/:id', (req,res)=>{
    let usuario=usuarios.find(u=>u.id===parseInt(req.params.id));
    if(!usuario)res.status(404).send('ID no encontrado');
    res.send(usuario);
}) */
//Validación con Joi
app.post('/api/peticion', (req,res)=>{
    /* const schema=Joi.object({
        nombre:Joi.string().min(3).required()
    }); */
    const {error,value}=validarUsuario(req.body.nombre);
    if(!error){
        //generando la variable
        const aux={
            id:usuarios.length+1,
            nombre: value.nombre
        };
        //guardando la variable
        usuarios.push(aux);
        res.send(aux);
    }else{
        res.status(400).send(error.details[0].message);
    }

    /* 
    Validación sencilla
    if(!req.body.nombre || req.body.nombre.length<=2){
        res.status(400).send("Debe ingresar un nombre de más de 2 caractéres");
        return;
    }
    //generando la variable
    const aux={
        id:usuarios.length+1,
        nombre: req.body.nombre
    };
    //guardando la variable
    usuarios.push(aux);
    res.send(aux); */
})
/**
 * PUT
 */
app.put('/api/peticion/:id',(req,resp)=>{
    
    let usuario=encontrarUsuario(req.params.id);
    if(!usuario){
        resp.status(404).send('ID no encontrado');//identificando si el usuario existe
        return;
    }
    const {error,value}=validarUsuario(req.body.nombre);
    if(error){
        resp.status(400).send(error.details[0].message);
        return;
    }
    //guardando la variable
    usuario.nombre=value.nombre;
    resp.send(usuario);
})

app.delete('/api/peticion/:id',(req,resp)=>{
    let usuario=encontrarUsuario(req.params.id);
    if(!usuario){
        resp.status(404).send('ID no encontrado');//identificando si el usuario existe
        return;
    }
    const index=usuarios.indexOf(usuario);
    usuarios.splice(index,1);
    resp.send(usuario);
})

const port=process.env.PORT || 3000;//indicando que cree una variable de entorno

app.listen(port, ()=>{
    console.log(`Escuchando al puerto ${port}...`)
});

function encontrarUsuario(id){
    let usuario=usuarios.find(u=>u.id===parseInt(id));
    return usuario;    
}

function validarUsuario(nom){
    const schema=Joi.object({
        nombre:Joi.string().min(3).required()
    });
    return schema.validate({nombre:nom});
}
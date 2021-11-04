function logger(req, resp, next){
    console.log("cargando...");
    next();
}

module.exports = logger;
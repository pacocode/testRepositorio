const { URL } = require("url");

const urlValidar = (req, res, next) => {
    try{
        const { origin } = req.body;
        console.log(req.body);
        const urlFronend = new URL(origin);
        if (urlFronend.origin !== "null"){
            if(
                urlFronend.protocol === 'http:' ||
                urlFronend.protocol === 'https:'
            ) {
                return next();
            }

            throw new Error("Tiene que tener https://"); 
        }
        throw new Error("No Valida"); 
    }catch(error) {
        //console.log(error);
        //return res.send('url no valida');
        if(error.message === 'Invalid URL'){
            req.flash("mensajes", [{ msg: "URL no valida" }]);
        } else {
            req.flash("mensajes", [{ msg: error.message }]);
        }
        
        return res.redirect("/")
    }
}

module.exports = urlValidar;
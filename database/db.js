const mongoose = require('mongoose');
require('dotenv').config();

const clientDB = mongoose
    .connect(process.env.URI)
    .then((m) => {
        console.log('DB Conteado 🤗');
        return m.connection.getClient();
    })
    .catch((e) => console.log('Fallo la conexión ' + e));

module.exports = clientDB;
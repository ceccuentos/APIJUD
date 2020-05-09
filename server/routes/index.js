const express = require('express');
const app = express();



app.get('/', async function(req, res) {
    res.send('Test API-Causa: online');
});


app.use(require('./login')) // Obtener Token
app.use(require('./civil')) // Causa Civil
    //app.use(require('./suprema'))   // Causa corte suprema
    //app.use(require('./Capelaciones'))   // Causa corte apelaciones
    //app.use(require('./laboral'))   // Causa Civil
    //app.use(require('./penal'))   // Causa Penal
    //app.use(require('./familia'))   // Causa Familia


module.exports = app;
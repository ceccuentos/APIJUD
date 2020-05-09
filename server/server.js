const express = require('express')
const bodyParser = require('body-parser');
const logger = require('./utils/logger');
const redis = require('redis');
require('dotenv').config()
const app = express()

// TODO:
// - Agregar autenticación  OK
// - Agregar Logs  OK
// - Mejorar arquitectura (estructura para otros tipos de causas (Penal, familia, etc.) ) OK
// - Agregar otros scrap-datos necesarios: Head y Tabs (litigantes y escritos)
// - conversión con enum de codTribunal (sacar datos desde pjud)
// - Agregar REDIS a respuesta para no saturar 

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const client = exports.client = redis.createClient(process.env.REDIS_URL);
client.on('connect', function() {
    logger.info('Redis client connected');
});

app.use(require('./routes/index'))

app.set('puerto', process.env.PORT || 3001);
app.listen(app.get('puerto'), function() {
    logger.info(`App listening on port ${app.get('puerto')}`);
});

module.exports = app
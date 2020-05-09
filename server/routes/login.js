const express = require('express');
const app = express();

const jwt = require('jsonwebtoken')

app.post('/login', (req, res) => {
    let user = req.query.user
    if (user !== 'Cec-20200507qMpZ') {
        return res.status(400).json({
            ok: false,
            err: { message: 'Usuario o contraseña incorrectos.' }
        })
    }

    let token = jwt.sign({ usuario: user },
        process.env.SEED, { expiresIn: process.env.EXPIRATION_TOKEN });

    res.json({
        ok: true,
        usuario: user,
        token
    })

})

module.exports = app
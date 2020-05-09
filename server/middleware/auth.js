const jwt = require('jsonwebtoken')

// verifica token normal
const verifyToken = (req, res, next) => {
    let token = req.get('token'); // o token

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err
            })
        }

        next();
    })


}


module.exports = { verifyToken }